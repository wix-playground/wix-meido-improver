import browser from "webextension-polyfill";

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DEFAULT_OPTIONS = {
  enableNotifications: true,
  notifications: [
    {dayName: DAY_NAMES[3], time: '12:00'},
    {dayName: DAY_NAMES[4], time: '12:00'},
    {dayName: DAY_NAMES[4], time: '14:00'},
    {dayName: DAY_NAMES[4], time: '14:30'},
    {dayName: DAY_NAMES[4], time: '14:45'},
  ],
};


export async function getOptions() {
  const items = await browser.storage.sync.get('options')
    .catch(() => browser.storage.local.get('options'));

  return ({
    ...DEFAULT_OPTIONS,
    ...items.options
  });
}

export async function setOptions(options) {
  return await browser.storage.sync.set({options})
    .catch(() => browser.storage.local.set({options}));
}

export async function resetOptions() {
  await setOptions(DEFAULT_OPTIONS);
}
