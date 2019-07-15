fixFavoritesDataStructure();
syncRatings();

async function fixFavoritesDataStructure() {
  const {...data} = await getData();
  const favorites = {};

  Object.entries(data).forEach(([key, value]) => {
    if (parseInt(key).toString() === key) {
      favorites[key] = value;
      delete data[key];
    }
  });

  if (Object.keys(favorites).length > 0) {
    const newFavorites = {...data.favorites, ...favorites};
    await saveData({...data, favorites: newFavorites});
    await saveFavorites(newFavorites);
  } else {
    await syncFavorites();
  }
}

async function syncFavorites() {
  const favorites = await fetchFavorites();
  await updateData(() => ({favorites}));
}

async function syncRatings() {
  const {userRatings, avgRatings} = await fetchBothRatings();
  await updateData(() => ({userRatings, avgRatings}));
}

/**
 * @return {string}
 */
function getAuthCookie() {
  const reg = /(^|; )([a-z0-9]{32}=[^;]*)/;
  return (document.cookie.match(reg) || '')[2];
}

async function fetchFavorites() {
  return await doRequest('GET', '/favorites');
}

/**
 * @param {Object.<string, boolean>} favorites - where "key" (string) is dishId
 * @return {Promise<void>}
 */
async function saveFavorites(favorites) {
  const updatedFavorites = await doRequest('POST', '/favorites', {favorites});
  await updateData(() => ({favorites: updatedFavorites}));
}

/**
 * @param {string} dishId
 * @param {number} rating
 * @return {Promise<void>}
 */
async function setRating(dishId, rating) {
  await updateData(({userRatings, avgRatings}) => {
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

  const {userRatings, avgRatings} = await doRequest('POST', `/ratings/${encodeURIComponent(dishId)}`, {rating});
  await updateData(() => ({userRatings, avgRatings}));
}

/**
 * @param {string} dishId
 * @return {Promise<void>}
 */
async function deleteRating(dishId) {
  await updateData(({userRatings}) => {
    const newRatings = userRatings || {};
    delete newRatings[dishId];
    return ({userRatings: newRatings});
  });

  const {userRatings, avgRatings} = await doRequest('DELETE', `/ratings/${encodeURIComponent(dishId)}`);
  await updateData(() => ({userRatings, avgRatings}));
}

/**
 * @param {string} dishId
 * @param { boolean} favorite
 * @return {Promise<void>}
 */
async function toggleFavorite(dishId, favorite) {
 await updateData(({favorites}) => ({favorites: {...favorites, [dishId]: favorite}}));

  const favorites = await doRequest('POST', `/favorites/${encodeURIComponent(dishId)}`, {favorite});
 await updateData(() => ({favorites}));
}

async function fetchBothRatings() {
  return await doRequest('GET', '/both-ratings');
}


/**
 * @param {'GET'|'POST'|'DELETE'} method
 * @param {string} endpoint
 * @param {Object=} params
 * @return {Promise<*>}
 */
async function doRequest(method, endpoint, params) {
  const data = {...params, authCookie: getAuthCookie()};

  const response = await browser.runtime.sendMessage({
    contentScriptQuery: "request",
    args: {method, endpoint, data}
  });

  const [error, result] = response || ['error'];

  if (error) {
    throw error
  }

  return result;
}
