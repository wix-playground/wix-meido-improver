fixFavoritesDataStructure();
syncRatings();

async function fixFavoritesDataStructure() {
  const {...data} = getData();
  const favorites = {};

  Object.entries(data).forEach(([key, value]) => {
    if (parseInt(key).toString() === key) {
      favorites[key] = value;
      delete data[key];
    }
  });

  if (Object.keys(favorites).length > 0) {
    const newFavorites = {...data.favorites, ...favorites};
    saveData({...data, favorites: newFavorites});
    await saveFavorites(newFavorites);
  } else {
    await syncFavorites();
  }
}

async function syncFavorites() {
  await fetchFavorites().then(favorites => updateData(() => ({favorites})));
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
  await doRequest('POST', '/favorites', {favorites});
  await syncFavorites();
}

async function setRating(dishId, rating) {
  updateData(({userRatings, avgRatings}) => {
    const avg = avgRatings[dishId] || {count: 0, avg: 0};

    const newAvg = {
      count: avg.count + 1,
      avg: (avg.count * avg.avg + rating) / (avg.count + 1)
    };

    return ({
      userRatings: {...userRatings, [dishId]: rating},
      avgRatings: {...avgRatings, [dishId]: newAvg}
    });
  });

  await doRequest('POST', `/ratings/${encodeURIComponent(dishId)}`, {rating});
  await syncRatings();
}

async function deleteRating(dishId) {
  updateData(({userRatings}) => {
    const newRatings = userRatings || {};
    delete newRatings[dishId];
    return ({userRatings: newRatings});
  });
  await doRequest('DELETE', `/ratings/${encodeURIComponent(dishId)}`);
  await syncRatings();
}

async function toggleFavorite(dishId) {
  const favorite = !isFavorite(dishId);
  updateData(({favorites}) => ({favorites: {...favorites, [dishId]: favorite}}));
  await doRequest('POST', `/favorites/${encodeURIComponent(dishId)}`, {favorite});
  await syncFavorites();
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