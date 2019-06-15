const STORAGE_KEY = '__ITDXER_storage';

const listeners = [];

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

  return typeof data.favorites[dishId] === "undefined"
    ? !!data[dishId]
    : data.favorites[dishId];
}

function setFavorite(dishId, isFavorite) {
  updateData(data => ({
    favorites: {
      ...data.favorites,
      [dishId]: isFavorite
    }
  }));
}