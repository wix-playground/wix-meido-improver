import browser from 'webextension-polyfill';

type Notification = {
  dayName: string;
  time: string;
};
export type Options = {
  enableNotifications: boolean;
  notifications: Notification[];
};
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DEFAULT_OPTIONS: Options = {
  enableNotifications: true,
  notifications: [
    { dayName: DAY_NAMES[3], time: '12:00' },
    { dayName: DAY_NAMES[4], time: '12:00' },
    { dayName: DAY_NAMES[4], time: '14:00' },
    { dayName: DAY_NAMES[4], time: '14:30' },
    { dayName: DAY_NAMES[4], time: '14:45' },
  ],
};

export async function getOptions(): Promise<Options> {
  const items = await browser.storage.sync.get('options').catch(() => browser.storage.local.get('options'));

  return {
    ...DEFAULT_OPTIONS,
    ...items.options,
  };
}

export async function setOptions(options: Options): Promise<void> {
  await browser.storage.sync.set({ options }).catch(() => browser.storage.local.set({ options }));
}

export async function resetOptions(): Promise<void> {
  await setOptions(DEFAULT_OPTIONS);
}
