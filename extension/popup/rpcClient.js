let loaded = false;
const server = new PostMessageServer({
  parentLoaded: () => loaded = true,
  parentBeforeUnload: () => loaded = false,
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
const callInQueue = (fn) =>
  new Promise((resolve, reject) => {
    queue = queue.then(
      () => Promise.resolve(fn()).then(resolve, reject)
    )
  });



function createRpc() {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.style.width = '100%';
  document.body.appendChild(iframe);

  const client = new PostMessageClient(iframe.contentWindow);
  client.mount(window);

  return {client, iframe};
}



let client = null;
let iframe = null;
async function getRpcClient(src) {
  let justCreated = false;
  if (!client || !iframe) {
    ({client, iframe} = createRpc());
    justCreated = true;
  }

  if (src || justCreated) {
    iframe.src = src || 'https://wix.getmeido.com/order';
    await waitLoaded();
  }

  return client;
}

async function isLoggedIn() {
  const client = await getRpcClient();
  return client.request('isLoggedIn');
}

async function openContractor(contractorName) {
  const client = await getRpcClient('https://wix.getmeido.com/order');
  await client.request('openContractor', contractorName);
  await waitLoaded();
}

async function clickOneClickBuy(dishId) {
  const client = await getRpcClient();
  await client.request('clickOneClickBuy', dishId);
  await waitLoaded();
}

async function confirmOrder(date) {
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

async function removeOrder(orderId, dishId) {
  const client = await getRpcClient();
  await client.request('removeOrder', orderId, dishId);
}
