import { PostMessageClient, PostMessageServer } from '../modules/postMessageRPC';
import { DishId } from '../modules/database';

let loaded = false;
const server = new PostMessageServer({
  childLoaded: () => (loaded = true),
  childBeforeUnload: () => (loaded = false),
});
server.mount(window);

const waitLoaded = () => {
  loaded = false;

  const wait: () => Promise<void> = () =>
    new Promise(resolve => {
      if (loaded) {
        return resolve();
      } else {
        return setTimeout(() => resolve(wait()), 100);
      }
    });

  return wait();
};

let queue = Promise.resolve();
export const callInQueue = (fn: (...args: any[]) => any) =>
  new Promise((resolve, reject) => {
    queue = queue.then(() => Promise.resolve(fn()).then(resolve, reject));
  });

async function createRpc(
  src = 'https://wix.getmeido.com/order'
): Promise<{ client: PostMessageClient; iframe: HTMLIFrameElement }> {
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

  return { client, iframe };
}

let client: PostMessageClient | null = null;
let iframe: HTMLIFrameElement | null = null;

async function getRpcClient(src?: string): Promise<PostMessageClient> {
  let justCreated = false;
  if (!client || !iframe) {
    ({ client, iframe } = await createRpc(src));
    justCreated = true;
  }

  if (src && !justCreated) {
    iframe.src = src;
    await waitLoaded();
  }

  return client;
}

export async function isLoggedIn(): Promise<boolean> {
  const client = await getRpcClient();
  return (await client.request('isLoggedIn')) as boolean;
}

export async function openContractor(contractorName: string): Promise<void> {
  const client = await getRpcClient('https://wix.getmeido.com/order');
  await client.request('openContractor', contractorName);
  await waitLoaded();
}

export async function clickOneClickBuy(dishId: DishId): Promise<void> {
  const client = await getRpcClient();
  await client.request('clickOneClickBuy', dishId);
  await waitLoaded();
}

export async function confirmOrder(date: Date): Promise<void> {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1);
  const day = String(date.getDate());

  const query = new URLSearchParams({ year, month, day }).toString();
  const client = await getRpcClient('https://wix.getmeido.com/order/fast?' + query);

  const dateStr = [year, month, day].map(n => n.padStart(2, '0')).join('-');

  await client.request('confirmOrder', dateStr);
}

export async function removeOrder(orderId: string, dishId: DishId): Promise<void> {
  const client = await getRpcClient();
  await client.request('removeOrder', orderId, dishId);
}

export async function callRefreshOrderedDishesCache(): Promise<void> {
  const client = await getRpcClient();
  await client.request('callRefreshOrderedDishesCache');
}
