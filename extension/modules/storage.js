const STORAGE_KEY = '__ITDXER_storage';

const listeners = [];

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
  }
}

function getData() {
  let data = null;

  try {
    data = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    console.log(error);
  }

  return data || {};
}

function saveData(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    listeners.forEach(listener => listener(data));
  } catch (error) {
    console.log(error);
  }
}

function updateData(fn) {
  const data = getData();
  saveData({...data, ...fn(data)});
}

function subscribeForStorageChanges(handler) {
  listeners.push(handler);
}

function isFavorite(dishId) {
  const data = getData();
  const favorites = data.favorites || {};

  return favorites[dishId];
}

function setFavorite(dishId, isFavorite) {
  updateData(data => ({
    favorites: {
      ...data.favorites,
      [dishId]: isFavorite
    }
  }));
}