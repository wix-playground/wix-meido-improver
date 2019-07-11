const DISH_COUNT_CLASS = '__ITDXER_dish_count';
const CONTRACTOR_COUNT_CLASS = '__ITDXER_contractor_count';

/**
 * Parsed order object
 *
 * @typedef {Object} Order
 * @property {string} date - ISO date string
 * @property {string} id - id of order
 */

/**
 * Parsed dish object that was ordered on specific date
 *
 * @typedef {Object} Dish
 * @property {string} dish - dish name
 * @property {string} date - the date on which the dish was ordered
 * @property {string} contractor - food supplier
 */


/**
 * @return {Promise<Order[]>}
 */
async function fetchOrders() {
  let orders = new Map();
  let i = 1;
  let newOrdersFound = true;

  while (newOrdersFound) {
    const response = await fetch(`https://wix.getmeido.com/order/history/_url/%2Forder%2Fhistory/OrderMain_page/${i}`);
    const text = await response.text();
    const parsedOrders = [...text.matchAll(/<td>#(\d+)<\/td><td>(\w+\s\d+,\s\d+)<\/td>/g)].map(([all, number, date]) => ({
      id: number,
      date: (new Date(`${date} 00:00:00z`)).toISOString(),
    }));

    newOrdersFound = parsedOrders.some((order) => !orders.has(order.id));

    parsedOrders.forEach(order => {
      orders.set(order.id, order);
    });

    i = i + 1;
  }

  return [...orders.values()];
}

/**
 * @param {Order[]} orders - list of parsed orders from history
 * @return {Promise<Dish[]>}
 */
async function fetchOrderedDishes(orders) {
  return [].concat(
    ...await Promise.all(orders.map(async ({id, date}) => {
      const response = await fetch(`https://wix.getmeido.com/order/view/id/${id}`);
      const text = await response.text();
      return [...text.matchAll(/<td>(.*)\(Поставщик: <b>(.*)<\/b>\)/g)].map(([all, dish, contractor]) => ({
        dish: unescape(dish).trim(),
        date,
        contractor: unescape(contractor).trim()
      }));
    }))
  );
}

async function refreshOrderedDishesCache() {
  const orderedDishes = await fetchOrderedDishes(await fetchOrders());

  await updateData(() => ({
    orderedDishes: {
      updatedDate: new Date(),
      list: orderedDishes,
    }
  }));
}

async function invalidateOrderedDishesCache() {
  await updateData(() => ({
    orderedDishes: null
  }))
}

async function getOrderedDishes() {
  let data = await getData();
  if (!data.orderedDishes || isDateBeforeYesterday(data.orderedDishes.updatedDate)) {
    await refreshOrderedDishesCache();
    data = await getData();
  }

  return data.orderedDishes.list || [];
}


function isDateBeforeYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(date) < yesterday;
}

async function renderOrderedDishes(callback) {
  const allDishes = await getOrderedDishes();
  const dishesByContractor = allDishes.reduce(
    (by, {dish, contractor}) => ({
      ...by,
      [contractor]: [...(by[contractor] || []), dish]
    }),
    {}
  );

  const contractorTab = document.querySelectorAll('.suppliers .restaurants__nav li a');
  [...contractorTab].forEach(link => {
    const contractorName = link.innerText.trim();
    const count = Object.keys(dishesByContractor[contractorName] || {}).length;

    if (count > 0) {
      const countElem = document.createElement('div');
      countElem.innerText = count;
      countElem.className = CONTRACTOR_COUNT_CLASS;
      countElem.title = `You made ${count} orders in this restaurant`;
      link.parentNode.insertBefore(countElem, link.nextSibling);
    }
  });

  const activeContractorTab = document.querySelector('.suppliers .restaurants__nav li.active a');

  if (activeContractorTab) {
    const activeContractorName = activeContractorTab.innerText.trim();
    const activeDishes = dishesByContractor[activeContractorName];
    const dishesCount = new Map();
    activeDishes.forEach(dishName => {
      if (!dishesCount.has(dishName)) {
        dishesCount.set(dishName, 0);
      }
      dishesCount.set(dishName, dishesCount.get(dishName) + 1);
    });

    const contents = document.querySelectorAll('.tab-content > .tab-pane > .menu-item > .menu-item__content');
    [...contents].forEach(content => {
      const dishName = content.querySelector('h4').innerText.trim();
      if (dishesCount.has(dishName)) {
        const countElem = document.createElement('div');
        countElem.innerText = dishesCount.get(dishName);
        countElem.className = DISH_COUNT_CLASS;
        countElem.title = `You bought this dish ${dishesCount.get(dishName)} times`;
        content.querySelector('.menu-item__info').append(countElem);
      }
    })
  }

  callback();
}
