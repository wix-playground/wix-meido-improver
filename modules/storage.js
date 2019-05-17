const STORAGE_KEY = '__ITDXER_storage';

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
  } catch (error) {
    console.log(error);
  }
}

function updateData(fn) {
  const data = getData();
  return saveData({...data, ...fn(data)});
}