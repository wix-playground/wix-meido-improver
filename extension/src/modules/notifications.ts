import { browser } from 'webextension-polyfill-ts';
import { DAY_NAMES, IOptions } from '../options/storage';
import { IDishOrder, getData } from './localStorage';

interface ILargeWorkingWeekOrders {
  updatedDate: string | null;
  ordersPerDay: (IDishOrder | null)[];
  nextWeekOrdersPerDay: (IDishOrder | null)[];
  orderedDishesInvalidated: boolean;
}

export const WORKING_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
export type IWorkingDay = typeof WORKING_DAYS[number];

export interface IWorkingWeek<T> extends Record<IWorkingDay, T> {}

export interface IWorkingWeekDates extends IWorkingWeek<Date> {}

export interface IWorkingWeekDishOrders extends IWorkingWeek<IDishOrder | null> {}

export function weekToList<T>(week: IWorkingWeek<T>): T[] {
  return [week.monday, week.tuesday, week.wednesday, week.thursday, week.friday];
}

export function weekFromList<T>(list: T[]): IWorkingWeek<T> {
  return {
    monday: list[0],
    tuesday: list[1],
    wednesday: list[2],
    thursday: list[3],
    friday: list[4],
  };
}

export function mapWeek<R, T>(
  week: IWorkingWeek<T>,
  fn: (value: T, weekName: keyof IWorkingWeek<T>) => R
): IWorkingWeek<R> {
  return {
    monday: fn(week.monday, 'monday'),
    tuesday: fn(week.tuesday, 'tuesday'),
    wednesday: fn(week.wednesday, 'wednesday'),
    thursday: fn(week.thursday, 'thursday'),
    friday: fn(week.friday, 'friday'),
  };
}

export async function clearAlarms() {
  return await browser.alarms.clearAll();
}

export async function createAlarms(options: IOptions): Promise<void> {
  if (!options.enableNotifications) {
    return;
  }

  await Promise.all(
    options.notifications.map(({ dayName, time }) =>
      browser.alarms.create(`${dayName} ${time}`, {
        when: getDateByDayIndex(new Date(), DAY_NAMES.findIndex(day => day === dayName), time).getTime(),
        periodInMinutes: 60 * 24 * 7, // One week
      })
    )
  );
}

export function getDateByWeekIndex(weekIndex: number, day: IWorkingDay) {
  const date = getDateByDay(new Date(), day);
  date.setDate(date.getDate() + 7 * weekIndex);
  return date;
}

export function getDateByDay(baseDate: Date, newDay: IWorkingDay, time?: string): Date {
  const indexes: Record<IWorkingDay, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
  };

  return getDateByDayIndex(baseDate, indexes[newDay], time);
}

export function getDateByDayIndex(baseDate: Date, newDayIndex: number, time: string = '00:00'): Date {
  const [hh, mm] = time.split(':');
  const date = new Date(baseDate);
  date.setHours(Number(hh));
  date.setMinutes(Number(mm));
  date.setSeconds(0);
  date.setMilliseconds(0);

  const currentDayIndex = getWeekDayIndex(date);
  date.setDate(date.getDate() - (currentDayIndex - newDayIndex));

  return date;
}

export function getWeekDayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function getWeekDay(date: Date): IWorkingDay {
  const allDays: IWorkingDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  return allDays[getWeekDayIndex(date)];
}

export async function getWorkingWeekOrders(date: Date): Promise<ILargeWorkingWeekOrders> {
  const { orderedDishesInvalidated, ...data } = await getData();
  const { updatedDate, list } = data.orderedDishes || { list: [], updatedDate: null };

  const ordersPerDay = weekToList(filterWorkingWeekOrders(list, date));

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekOrdersPerDay = weekToList(filterWorkingWeekOrders(list, nextWeek));

  return { updatedDate, ordersPerDay, nextWeekOrdersPerDay, orderedDishesInvalidated };
}

export function filterWorkingWeekOrders(list: IDishOrder[], date: Date): IWorkingWeekDishOrders {
  return mapWeek(
    getWorkingWeekDays(date),
    weekDate => list.find(order => isSameDay(weekDate, new Date(order.date))) || null
  );
}

export function isSameDay(dateOne: Date, dateTwo: Date): boolean {
  return (
    dateOne.getFullYear() === dateTwo.getFullYear() &&
    dateOne.getMonth() === dateTwo.getMonth() &&
    dateOne.getDate() === dateTwo.getDate()
  );
}

export function getWorkingWeekDays(date: Date): IWorkingWeekDates {
  const monday = getDateByDayIndex(date, 0, '00:00');

  const arr = new Array(5).fill(null).map((_, weekDayIndex) => {
    const newDate = new Date(monday);
    newDate.setDate(monday.getDate() + weekDayIndex);
    return newDate;
  });

  return weekFromList(arr);
}
