subscribeForStorageChanges(data => saveFavorites(data.favorites));


syncFavorites();

function syncFavorites() {
  const {...data} = getData();
  const favorites = {...(data.favorites || {})};

  Object.entries(data).forEach(([key, value]) => {
    if (parseInt(key).toString() === key) {
      favorites[key] = value;
      delete data[key];
    }
  });

  if (Object.keys(favorites).length > 0) {
    saveData({...data, favorites});
  } else {
    fetchFavorites().then(favorites => {
      if (favorites) {
        updateData(() => ({favorites}));
      }
    });
  }
}

function getAuthCookie() {
  const reg = /(^|; )([a-z0-9]{32}=[^;]*)/;
  return document.cookie.match(reg)[2];
}

async function fetchFavorites() {
  return await doRequest('GET', '/favorites')
}

async function saveFavorites(favorites) {
  return await doRequest('POST', '/favorites', {favorites})
}

async function doRequest(method, endpoint, params) {
  const data = {...params, authCookie: getAuthCookie()};

  return new Promise((resolve, reject) =>
    chrome.runtime.sendMessage(
      {contentScriptQuery: "request", args: {method, endpoint, data}},
      ([error, result] = ['error']) => error ? reject(error) : resolve(result)
    )
  );
}