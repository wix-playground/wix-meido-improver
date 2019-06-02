const DISH_COUNT_CLASS = '__ITDXER_dish_count';
const CONTRACTOR_COUNT_CLASS = '__ITDXER_contractor_count';

async function fetchOrderIds() {
  const ids = new Set();
  let i = 1;
  let newIdsFound = true;

  while (newIdsFound) {
    const response = await fetch(`https://wix.getmeido.com/order/history/_url/%2Forder%2Fhistory/OrderMain_page/${i}`);
    const text = await response.text();
    const orderIds = [...text.matchAll(/<td>#(\d+)<\/td>/g)].map(([all, number]) => number);
    newIdsFound = orderIds.some(newId => !ids.has(newId));
    orderIds.forEach(newId => ids.add(newId));
    i = i + 1;
  }

  return [...ids.values()];
}

async function fetchOrderedDishes(orderIds) {
  return [].concat(
    ...await Promise.all(orderIds.map(async orderId => {
      const response = await fetch(`https://wix.getmeido.com/order/view/id/${orderId}`);
      const text = await response.text();
      return [...text.matchAll(/<td>(.*)\(Поставщик: <b>(.*)<\/b>\)/g)].map(([all, dish, contractor]) => ({
        dish: unescape(dish).trim(),
        contractor: unescape(contractor).trim()
      }));
    }))
  );
}

async function refreshOrderedDishesCache() {
  const orderedDishes = await fetchOrderedDishes(await fetchOrderIds());

  updateData(() => ({
    orderedDishes: {
      updatedDate: new Date(),
      list: orderedDishes,
    }
  }));
}

async function unvalidateOrderedDishesCache() {
  updateData(() => ({
    orderedDishes: null
  }))
}

async function getOrderedDishes() {
  const data = getData();
  if (!data.orderedDishes || isDateBeforeYesterday(data.orderedDishes.updatedDate)) {
    await refreshOrderedDishesCache();
  }

  return getData().orderedDishes.list;
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

    console.log([...dishesCount.entries()]);

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