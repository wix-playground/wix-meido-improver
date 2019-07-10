browser.runtime.onInstalled.addListener(async () => {
  clearAlarms()
    .then(() => getOptions())
    .then(options => createAlarms(options));
});

browser.storage.onChanged.addListener(changes => {
  if (changes.options) {
    clearAlarms().then(() => createAlarms(changes.options.newValue));
  }
});

browser.alarms.onAlarm.addListener(() => {
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
    browser.notifications.create(null, {...notificationOptions, buttons})
  } catch (e) {
    browser.notifications.create(null, notificationOptions)
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
  (request, sender, sendResponse) => {
    const {contentScriptQuery, args} = request;
    if (contentScriptQuery === 'request') {
      const {method, endpoint, data} = args;

      doRequest(method, endpoint, data)
        .then(result => sendResponse([null, result]))
        .catch(error => sendResponse([error]));

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

  const responseData = await response.text()
    .then(text => {
      try {
        return JSON.parse(text)
      } catch (error) {
        return text;
      }
    });

  if (response.ok) {
    return responseData;
  } else {
    throw responseData;
  }
}
