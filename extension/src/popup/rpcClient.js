import {PostMessageClient, PostMessageServer} from "../modules/postMessageRPC";

let loaded = false;
const server = new PostMessageServer({
  childLoaded: () => loaded = true,
  childBeforeUnload: () => loaded = false,
});
server.mount(window);

const waitLoaded = () => {
  loaded = false;

  const wait = () => new Promise(resolve => {
    if (loaded) {
      return resolve();
    } else {
      return setTimeout(() => resolve(wait()), 100)
    }
  });

  return wait();
};



let queue = Promise.resolve();
export const callInQueue = (fn) =>
  new Promise((resolve, reject) => {
    queue = queue.then(
      () => Promise.resolve(fn()).then(resolve, reject)
    )
  });



async function createRpc(src = 'https://wix.getmeido.com/order') {
  const iframe = document.createElement('iframe');

  iframe.src = src;
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.position = 'absolute';
  iframe.style.opacity = '0';

  document.body.prepend(iframe);

  await waitLoaded();

  const client = new PostMessageClient(iframe.contentWindow);
  client.mount(window);

  return {client, iframe};
}



let client = null;
let iframe = null;
async function getRpcClient(src) {
  let justCreated = false;
  if (!client || !iframe) {
    ({client, iframe} = await createRpc(src));
    justCreated = true;
  }

  if (src && !justCreated) {
    iframe.src = src;
    await waitLoaded();
  }

  return client;
}

export async function isLoggedIn() {
  const client = await getRpcClient();
  return client.request('isLoggedIn');
}

export async function openContractor(contractorName) {
  const client = await getRpcClient('https://wix.getmeido.com/order');
  await client.request('openContractor', contractorName);
  await waitLoaded();
}

export async function clickOneClickBuy(dishId) {
  const client = await getRpcClient();
  await client.request('clickOneClickBuy', dishId);
  await waitLoaded();
}

export async function confirmOrder(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const query = new URLSearchParams({year, month, day}).toString();
  const client = await getRpcClient('https://wix.getmeido.com/order/fast?' + query);

  const dateStr = [year, month, day]
    .map(n => String(n).padStart(2, '0'))
    .join('-');

  await client.request('confirmOrder', dateStr);
}

export async function removeOrder(orderId, dishId) {
  const client = await getRpcClient();
  await client.request('removeOrder', orderId, dishId);
}

export async function callRefreshOrderedDishesCache() {
  const client = await getRpcClient();
  await client.request('callRefreshOrderedDishesCache');
}
