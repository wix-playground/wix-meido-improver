const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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


async function getOptions() {
  const items = await browser.storage.sync.get('options')
    .catch(() => browser.storage.local.get('options'));

  return ({
    ...DEFAULT_OPTIONS,
    ...items.options
  });
}

async function setOptions(options) {
  return await browser.storage.sync.set({options})
    .catch(() => browser.storage.local.set({options}));
}
