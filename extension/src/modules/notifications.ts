import browser from 'webextension-polyfill';
import { DAY_NAMES, Options } from '../options/storage';
import { DishOrder, getData } from './localStorage';

type WorkingWeekOrders = {
  updatedDate: string;
  ordersPerDay: DishOrder[];
  nextWeekOrdersPerDay: DishOrder[];
  orderedDishesInvalidated: boolean;
};
export async function clearAlarms() {
  return await browser.alarms.clearAll();
}

export async function createAlarms(options: Options): Promise<void> {
  if (!options.enableNotifications) {
    return;
  }

  await Promise.all(
    options.notifications.map(({ dayName, time }) =>
      browser.alarms.create(`${dayName} ${time}`, {
        when: getDateByDayIndex(new Date(), DAY_NAMES[dayName], time).getTime(),
        periodInMinutes: 7 * 24 * 60, // One week
      })
    )
  );
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

export async function getWorkingWeekOrders(date: Date): Promise<WorkingWeekOrders> {
  const { orderedDishesInvalidated, ...data } = await getData();
  const { updatedDate, list } = data.orderedDishes || { list: [], updatedDate: null };

  const ordersPerDay = getWorkingWeekDays(date).map(weekDate =>
    list.find(order => isSameDay(weekDate, new Date(order.date)))
  );

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekOrdersPerDay = getWorkingWeekDays(nextWeek).map(weekDate =>
    list.find(order => isSameDay(weekDate, new Date(order.date)))
  );

  return { updatedDate, ordersPerDay, nextWeekOrdersPerDay, orderedDishesInvalidated };
}

export function isSameDay(dateOne: Date, dateTwo: Date): boolean {
  return (
    dateOne.getFullYear() === dateTwo.getFullYear() &&
    dateOne.getMonth() === dateTwo.getMonth() &&
    dateOne.getDate() === dateTwo.getDate()
  );
}

export function getWorkingWeekDays(date: Date): Date[] {
  const monday = getDateByDayIndex(date, 0, '00:00');
  return new Array(5).fill(null).map((_, weekDayIndex) => {
    const newDate = new Date(monday);
    newDate.setDate(monday.getDate() + weekDayIndex);
    return newDate;
  });
}
