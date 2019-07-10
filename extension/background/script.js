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
  const buttons = [
    {title: 'Open Meido'},
    {title: 'Config Notifications'}
  ];

  const notificationOptions = {
    type: 'basic',
    title: 'Meido Order',
    message: 'Do not forget to make order for the next week',
    iconUrl: '../icons/icon48.png',
  };

  try {
    await browser.notifications.create(null, {...notificationOptions, buttons})
  } catch (e) {
    await browser.notifications.create(null, notificationOptions)
  }
});

browser.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    browser.tabs.create({url: 'https://wix.getmeido.com/order'});
  }

  if (buttonIndex === 1) {
    browser.runtime.openOptionsPage();
  }
});

browser.notifications.onClicked.addListener(() => {
  browser.tabs.create({url: 'https://wix.getmeido.com/order'})
});

browser.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    const {contentScriptQuery, args} = request;
    if (contentScriptQuery === 'request') {
      const {method, endpoint, data} = args;

      try {
        const result = await doRequest(method, endpoint, data);
        sendResponse([null, result])
      } catch (error) {
        sendResponse([error]);
      }

      return true;
    }
  });

async function doRequest(method, endpoint, data) {
  const isGetMethod = method.toUpperCase() === 'GET';
  const searchParams = new URLSearchParams(isGetMethod ? data : {}).toString();
  const body = isGetMethod ? null : JSON.stringify(data);
  const headers = isGetMethod ? {} : {'Content-Type': 'application/json'};

  const url = 'https://www.wix.com/_serverless/wix-meido-improver' + endpoint + '?' + searchParams;
  const response = await fetch(url, {method, body, headers});

  let responseData = await response.text();
  try {
    responseData = JSON.parse(responseData)
  } catch (error) {
  }

  if (response.ok) {
    return responseData;
  } else {
    throw responseData;
  }
}
