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
  const prevData = getData();

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    listeners.forEach(listener => listener(data, prevData));
  } catch (error) {
    console.log(error);
  }
}

function updateData(fn) {
  const prevData = getData();
  saveData({...prevData, ...fn(prevData)});
}

function subscribeForStorageChanges(handler) {
  listeners.push(handler);
}

function isFavorite(dishId) {
  const data = getData();
  const favorites = data.favorites || {};

  return favorites[dishId];
}
