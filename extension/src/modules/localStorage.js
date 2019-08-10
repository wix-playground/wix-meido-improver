import browser from "webextension-polyfill";

const STORAGE_KEY = '__ITDXER_storage';

/**
 * User specific data
 *
 * @typedef {Object} UserData
 *
 * @property {boolean} filterRating
 * @property {boolean} filterOrdered
 * @property {boolean} filterFavorite
 * @property {boolean} filterVegan
 * @property {string} filterText
 * @property {Object} userRatings
 * @property {Object} avgRatings
 * @property {Object} favorites
 * @property {Object|null} orderedDishes
 * @property {boolean} orderedDishesInvalidated
 */


/**
 * @return {Promise<UserData>}
 */
export async function getData() {
  let data = null;

  try {
    const localStorageData = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (localStorageData) {
      data = localStorageData;
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      const userDataItems = await browser.storage.local.get('userData');
      data = userDataItems.userData;
    }
  } catch (error) {
    console.log(error);
  }

  return fillDefaults(data);
}

function fillDefaults(data) {
  return {
    filterRating: false,
    filterOrdered: false,
    filterFavorite: false,
    filterVegan: false,
    filterText: '',
    userRatings: {},
    avgRatings: {},
    favorites: {},
    orderedDishes: null,
    orderedDishesInvalidated: false,
    ...data,
  };
}

/**
 * @return {Promise<void>}
 */
export async function clearData() {
  await browser.storage.local.remove('userData');
}

/**
 * @param {UserData} data
 * @return {Promise<void>}
 */
export async function saveData(data) {
  await browser.storage.local.set({userData: data});
}

/**
 * @param {Function} fn
 * @return {Promise<void>}
 */
export async function updateData(fn) {
  const prevData = await getData();
  await saveData({...prevData, ...fn(prevData)});
}

/**
 * @param {Function} handler
 */
export function subscribeForStorageChanges(handler) {
  browser.storage.onChanged.addListener(async changes => {
    if (changes.userData) {
      const {newValue, oldValue} = changes.userData;
      handler(fillDefaults(newValue), oldValue);
    }
  });
}

let loading = 0;
const loadingListeners = [];

export function subscribeForLoadingChanges(fn) {
  loadingListeners.push(fn);
}
export function startLoading() {
  loading++;
  loadingListeners.forEach(fn => fn(loading));
}

export function stopLoading() {
  loading--;
  loadingListeners.forEach(fn => fn(loading));
}

export function isLoading() {
  return loading > 0;
}
