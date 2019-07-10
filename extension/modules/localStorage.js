const STORAGE_KEY = '__ITDXER_storage';

const listeners = [];

/**
 * @return {Promise<{}>}
 */
async function getData() {
  let data = null;

  try {
    data = await browser.storage.local.get('userData')
      || JSON.parse(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    console.log(error);
  }

  return data || {};
}

/**
 * @param {Object} data
 * @return {Promise<void>}
 */
async function saveData(data) {
  const prevData = await getData();

  try {
    await browser.storage.local.get({userData: data});
    listeners.forEach(listener => listener(data, prevData));
  } catch (error) {
    console.log(error);
  }
}

/**
 * @param {Function} fn
 * @return {Promise<void>}
 */
async function updateData(fn) {
  const prevData = await getData();
  await saveData({...prevData, ...fn(prevData)});
}

/**
 * @param {Function} handler
 */
function subscribeForStorageChanges(handler) {
  listeners.push(handler);
}
