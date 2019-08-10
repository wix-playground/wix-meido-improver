import browser from "webextension-polyfill";
import {DAY_NAMES} from "../options/storage";
import {getData} from "./localStorage";


export async function clearAlarms() {
  return await browser.alarms.clearAll();
}

export async function createAlarms(options) {
  if (!options.enableNotifications) {
    return;
  }

  return Promise.all(
    options.notifications.map(({dayName, time}) =>
      browser.alarms.create(
        `${dayName} ${time}`,
        {
          when: getDateByDayIndex(new Date(), DAY_NAMES[dayName], time).getTime(),
          periodInMinutes: 7 * 24 * 60, // One week
        }
      )
    )
  )
}

export function getDateByDayIndex(baseDate, newDayIndex, time = '00:00') {
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

export function getWeekDayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export async function getWorkingWeekOrders(date) {
  const {orderedDishesInvalidated, ...data} = await getData();
  const orderedDishes = data.orderedDishes || {};
  const updatedDate = orderedDishes.updatedDate;
  const orders = orderedDishes.list || [];

  const ordersPerDay = getWorkingWeekDays(date)
    .map(weekDate => orders.find(order => isSameDay(weekDate, new Date(order.date))));

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekOrdersPerDay = getWorkingWeekDays(nextWeek)
    .map(weekDate => orders.find(order => isSameDay(weekDate, new Date(order.date))));

  return {updatedDate, ordersPerDay, nextWeekOrdersPerDay, orderedDishesInvalidated};
}

export function isSameDay(dateOne, dateTwo) {
  return dateOne.getFullYear() === dateTwo.getFullYear()
    && dateOne.getMonth() === dateTwo.getMonth()
    && dateOne.getDate() === dateTwo.getDate();
}

export function getWorkingWeekDays(date) {
  const monday = getDateByDayIndex(date, 0, '00:00');
  return new Array(5)
    .fill(null)
    .map((_, weekDayIndex) => {
      const newDate = new Date(monday);
      newDate.setDate(monday.getDate() + weekDayIndex);
      return newDate;
    });
}
