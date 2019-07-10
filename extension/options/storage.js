const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_OPTIONS = {
  enableNotifications: true,
  notifications: [
    {
      dayName: DAY_NAMES[4],
      time: '12:00',
    }
  ],
};


function getOptions() {
  return browser.storage.sync.get('options')
    .catch(() => browser.storage.local.get('options'))
    .then(items => ({
      ...DEFAULT_OPTIONS,
      ...items.options
    }));
}

function setOptions(options) {
  return browser.storage.sync.set({options})
    .catch(() => browser.storage.local.set({options}));
}
