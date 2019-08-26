import { browser } from 'webextension-polyfill-ts';

export interface INotification {
  dayName: string;
  time: string;
}

export interface IOptions {
  enableNotifications: boolean;
  notifications: INotification[];
}

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
export const DEFAULT_OPTIONS: IOptions = {
  enableNotifications: true,
  notifications: [
    { dayName: DAY_NAMES[3], time: '12:00' },
    { dayName: DAY_NAMES[4], time: '12:00' },
    { dayName: DAY_NAMES[4], time: '14:00' },
    { dayName: DAY_NAMES[4], time: '14:30' },
    { dayName: DAY_NAMES[4], time: '14:45' },
  ],
};

export async function getOptions(): Promise<IOptions> {
  const items = await browser.storage.sync.get('options').catch(() => browser.storage.local.get('options'));

  return {
    ...DEFAULT_OPTIONS,
    ...items.options,
  };
}

export async function setOptions(options: IOptions): Promise<void> {
  await browser.storage.sync.set({ options }).catch(() => browser.storage.local.set({ options }));
}

export async function resetOptions(): Promise<void> {
  await setOptions(DEFAULT_OPTIONS);
}
