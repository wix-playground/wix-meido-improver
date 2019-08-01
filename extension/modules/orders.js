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
 * @property {string} dishName - dish name
 * @property {string} dishId - dish id
 * @property {string} orderId - order id
 * @property {string} date - the date on which the dish was ordered
 * @property {string} contractorName - food supplier
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
    const parsedOrders = [...text.matchAll(/<td>#(\d+)<\/td><td>(\w+\s\d+,\s\d+)<\/td>/g)]
      .map(([all, orderId, dateStr]) => ({
        orderId,
        dateStr,
        date: (new Date(dateStr)).toISOString(),
      }));

    newOrdersFound = parsedOrders.some(order => !orders.has(order.orderId));

    parsedOrders.forEach(order => orders.set(order.orderId, order));
    i = i + 1;
  }

  return [...orders.values()];
}

/**
 * @param {Order[]} orders - list of parsed orders from history
 * @return {Promise<Dish[]>}
 */
async function fetchOrderedDishes(orders) {
  return await Promise.all(
    orders.map(async ({orderId, date}) => {
      const response = await fetch(`https://wix.getmeido.com/order/view/id/${orderId}`);
      const text = await response.text();

      const [, dishName, contractorName] = text.match(/<td>(.*)\(Поставщик: <b>(.*)<\/b>\)/) || [];
      const [, dishId] = text.match(/<td data-product-id="(\d+)"/) || [];

      return {
        dishName: unescape(dishName).trim(),
        dishId,
        orderId,
        date,
        contractorName: unescape(contractorName).trim()
      };
    })
  );
}

async function refreshOrderedDishesCache() {
  startLoading();
  try {
    const orders = await fetchOrders();
    const orderedDishes = await fetchOrderedDishes(orders);

    await updateData(() => ({
      orderedDishes: {
        updatedDate: new Date().toISOString(),
        list: orderedDishes,
      }
    }));
  } catch (error) {
    console.error(error);
  }
  stopLoading();
}

async function invalidateOrderedDishesCache() {
  await updateData(() => ({
    orderedDishes: null
  }));
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
  const dishIdsByContractor = allDishes.reduce(
    (by, {dishId, contractorName}) => ({
      ...by,
      [contractorName]: [...(by[contractorName] || []), dishId]
    }),
    {}
  );

  const contractorTab = document.querySelectorAll('.suppliers .restaurants__nav li a');
  [...contractorTab].forEach(link => {
    const contractorName = link.innerText.trim();
    const count = Object.keys(dishIdsByContractor[contractorName] || {}).length;

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
    const activeDishes = dishIdsByContractor[activeContractorName];
    const dishesCount = new Map();
    activeDishes.forEach(dishId => {
      if (!dishesCount.has(dishId)) {
        dishesCount.set(dishId, 0);
      }
      dishesCount.set(dishId, dishesCount.get(dishId) + 1);
    });

    const contents = document.querySelectorAll('.tab-content > .tab-pane > .menu-item > .menu-item__content');
    [...contents].forEach(content => {
      const button = content.querySelector('a.btn.buy');
      const dishId = button.href.split('/').pop();

      if (dishesCount.has(dishId)) {
        const countElem = document.createElement('div');
        countElem.innerText = dishesCount.get(dishId);
        countElem.className = DISH_COUNT_CLASS;
        countElem.title = `You bought this dish ${dishesCount.get(dishId)} times`;
        content.querySelector('.menu-item__info').append(countElem);
      }
    })
  }

  callback();
}
