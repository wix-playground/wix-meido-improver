import { browser } from 'webextension-polyfill-ts';
import { clearAlarms, createAlarms, getWorkingWeekOrders } from './modules/notifications';
import { getOptions } from './options/storage';

browser.runtime.onInstalled.addListener(async () => {
  await clearAlarms();
  const options = await getOptions();
  await createAlarms(options);
});

browser.storage.onChanged.addListener(async changes => {
  if (changes.options) {
    await clearAlarms();
    await createAlarms(changes.options.newValue);
  }
});

browser.alarms.onAlarm.addListener(async () => {
  await showNotificationIfNoOrder();
});

browser.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    void browser.tabs.create({ url: 'https://wix.getmeido.com/order' });
  }

  if (buttonIndex === 1) {
    void browser.runtime.openOptionsPage();
  }
});

browser.notifications.onClicked.addListener(() => {
  void browser.tabs.create({ url: 'https://wix.getmeido.com/order' });
});

browser.runtime.onMessage.addListener(async request => {
  const { contentScriptQuery, args } = request;
  if (contentScriptQuery === 'request') {
    const { method, endpoint, data } = args;

    try {
      const result = await doRequest(method, endpoint, data);
      return [null, result];
    } catch (error) {
      return [error];
    }
  }
});

async function showNotificationIfNoOrder(): Promise<void> {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const { ordersPerDay } = await getWorkingWeekOrders(nextWeek);

  if (ordersPerDay.some(orderForADay => !orderForADay)) {
    await createNotification();
  }
}

async function createNotification(): Promise<void> {
  const buttons = [{ title: 'Open Meido' }, { title: 'Config Notifications' }];

  const notificationOptions: any = {
    type: 'basic',
    title: 'Meido Order',
    message: 'You have no orders for some days next week [Click – open Meido]',
    iconUrl: '../icons/icon48.png',
  };

  try {
    await browser.notifications.create(undefined, { ...notificationOptions, buttons });
  } catch (e) {
    await browser.notifications.create(undefined, notificationOptions);
  }
}

async function doRequest(method: 'GET' | 'POST', endpoint: string, data: any) {
  const isGetMethod = method.toUpperCase() === 'GET';
  const searchParams = new URLSearchParams(isGetMethod ? data : {}).toString();
  const body = isGetMethod ? null : JSON.stringify(data);
  const headers = isGetMethod ? [] : [['Content-Type', 'application/json']];

  const url = 'https://www.wix.com/_serverless/wix-meido-improver' + endpoint + '?' + searchParams;
  const response = await fetch(url, { method, body, headers });

  let responseData = await response.text();
  try {
    responseData = JSON.parse(responseData);
  } catch (error) {}

  if (response.ok) {
    return responseData;
  } else {
    throw responseData;
  }
}
