import { unescapeHtml } from './escapeHtml';
import { IDishOrder, getData, startLoading, stopLoading, updateData } from './localStorage';

export const DISH_COUNT_CLASS = '__ITDXER_dish_count';
const CONTRACTOR_COUNT_CLASS = '__ITDXER_contractor_count';

interface IOrder {
  date: string;
  dateStr: string;
  orderId: string;
}

async function fetchOrders(): Promise<IOrder[]> {
  const firstPageText = await fetchOrdersText(1);
  const pagesCount = parsePagesCount(firstPageText);
  const restPages = await Promise.all(
    new Array(pagesCount - 1)
      .fill(null)
      .map((_, index) => index + 2)
      .map(pageNumber => fetchOrdersText(pageNumber))
  );

  return (<IOrder[]>[]).concat(...[firstPageText, ...restPages].map(parseOrders));
}

async function fetchOrdersText(page: number): Promise<string> {
  const response = await fetch(`https://wix.getmeido.com/order/history/_url/%2Forder%2Fhistory/OrderMain_page/${page}`);
  return await response.text();
}

function parseOrders(text: string): IOrder[] {
  return [...text.matchAll(/<td>#(\d+)<\/td><td>(\w+\s\d+,\s\d+)<\/td>/g)].map(([all, orderId, dateStr]) => ({
    orderId,
    dateStr,
    date: new Date(dateStr).toISOString(),
  }));
}

function parsePagesCount(text: string): number {
  const [, resultCount = '0'] = text.match(/Displaying 1-10 of (\d+) results/) || [];
  return Math.ceil(Number(resultCount) / 10);
}

async function fetchOrderedDishes(orders: IOrder[]): Promise<IDishOrder[]> {
  return await Promise.all(
    orders.map(async ({ orderId, date }) => {
      const response = await fetch(`https://wix.getmeido.com/order/view/id/${orderId}`);
      const text = await response.text();

      const [, dishName = '', contractorName = ''] = text.match(/<td>(.*)<br>\s*\(Поставщик: <b>(.*)<\/b>\)/) || [];
      const [, dishId = ''] = text.match(/data-product-id="(\d+)"/) || [];

      return {
        dishName: unescapeHtml(dishName).trim(),
        dishId,
        orderId,
        date,
        contractorName: unescapeHtml(contractorName).trim(),
      };
    })
  );
}

export async function refreshOrderedDishesCache(): Promise<void> {
  startLoading();
  try {
    const orders = await fetchOrders();

    let data = await getData();
    const list = (data.orderedDishes && data.orderedDishes.list) || [];
    const oldOrdersIds = new Set(list.map(({ orderId }) => orderId));

    const newOrdersIds = new Set(orders.map(({ orderId }) => orderId));
    const createdOrders = orders.filter(({ orderId }) => !oldOrdersIds.has(orderId));
    const createdDishes = await fetchOrderedDishes(createdOrders);
    const liveDishes = list.filter(({ orderId }) => newOrdersIds.has(orderId));

    await updateData(() => ({
      orderedDishesInvalidated: false,
      orderedDishes: {
        updatedDate: new Date().toISOString(),
        list: [...liveDishes, ...createdDishes],
      },
    }));
  } catch (error) {
    console.error(error);
  }
  stopLoading();
}

export async function invalidateOrderedDishesCache(): Promise<void> {
  await updateData(() => ({
    orderedDishesInvalidated: true,
  }));
}

async function getOrderedDishes(): Promise<IDishOrder[]> {
  let data = await getData();
  if (
    !data.orderedDishes ||
    isDateBeforeYesterday(new Date(data.orderedDishes.updatedDate)) ||
    data.orderedDishesInvalidated
  ) {
    await refreshOrderedDishesCache();
    data = await getData();
  }

  return (data.orderedDishes && data.orderedDishes.list) || [];
}

function isDateBeforeYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(date) < yesterday;
}

export async function renderOrderedDishes(): Promise<void> {
  const allDishes = await getOrderedDishes();
  const dishIdsByContractor = allDishes.reduce(
    (by, { dishId, contractorName }) => ({
      ...by,
      [contractorName]: [...(by[contractorName] || []), dishId],
    }),
    <{ [key: string]: string[] }>{}
  );

  const contractorTab = document.querySelectorAll('.suppliers .restaurants__nav li a');
  [...contractorTab].forEach(link => {
    const contractorName = (<HTMLElement>link).innerText.trim();
    const count = Object.keys(dishIdsByContractor[contractorName] || {}).length;

    if (count > 0) {
      const countElem = document.createElement('div');
      countElem.innerText = String(count);
      countElem.className = CONTRACTOR_COUNT_CLASS;
      countElem.title = `You made ${count} orders in this restaurant`;
      link.parentNode && link.parentNode.insertBefore(countElem, link.nextSibling);
    }
  });

  const activeContractorTab: HTMLElement | null = document.querySelector('.suppliers .restaurants__nav li.active a');

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
      const button: HTMLAnchorElement | null = content.querySelector('a.btn.buy');
      const dishId = button ? button.href.split('/').pop() : '';

      if (dishesCount.has(dishId)) {
        const countElem = document.createElement('div');
        countElem.innerText = dishesCount.get(dishId);
        countElem.className = DISH_COUNT_CLASS;
        countElem.title = `You bought this dish ${dishesCount.get(dishId)} times`;
        const info: Element | null = content.querySelector('.menu-item__info');
        if (info) {
          info.append(countElem);
        }
      }
    });
  }
}
