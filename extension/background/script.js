chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    const {contentScriptQuery, args} = request;
    if (contentScriptQuery === 'request') {
      const {method, endpoint, data} = args;

      doRequest(method, endpoint, data)
        .then(result => sendResponse([null, result]))
        .catch(error => sendResponse([error]))

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