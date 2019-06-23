subscribeForStorageChanges((data, prevData) => {
  if (JSON.stringify(data.favorites) !== JSON.stringify(prevData.favorites)) {
    saveFavorites(data.favorites);
  }
});


syncFavorites();
syncRatings();

function syncFavorites() {
  const {...data} = getData();
  const favorites = {};

  Object.entries(data).forEach(([key, value]) => {
    if (parseInt(key).toString() === key) {
      favorites[key] = value;
      delete data[key];
    }
  });

  if (Object.keys(favorites).length > 0) {
    saveData({...data, favorites: {...data.favorites, ...favorites}});
  } else {
    fetchFavorites().then(favorites => updateData(() => ({favorites})));
  }
}

async function syncRatings() {
  await Promise.all([
    fetchUserRatings().then(userRatings => updateData(() => ({userRatings}))),
    fetchAvgRatings().then(avgRatings => updateData(() => ({avgRatings}))),
  ]);
}

function getAuthCookie() {
  const reg = /(^|; )([a-z0-9]{32}=[^;]*)/;
  return (document.cookie.match(reg) || '')[2];
}

async function fetchFavorites() {
  return await doRequest('GET', '/favorites');
}

async function saveFavorites(favorites) {
  return await doRequest('POST', '/favorites', {favorites})
}

async function rate(dishId, rating) {
  updateData(({userRatings}) => ({userRatings: {...userRatings, [dishId]: rating}}));
  await doRequest('POST', `/ratings/${encodeURIComponent(dishId)}`, {rating})
  await syncRatings();
}

async function fetchUserRatings() {
  return await doRequest('GET', '/ratings');
}

async function fetchAvgRatings() {
  return await doRequest('GET', '/avg-ratings');
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