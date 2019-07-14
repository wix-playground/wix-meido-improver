async function clearAlarms() {
  return await browser.alarms.clearAll();
}

async function createAlarms(options) {
  if (!options.enableNotifications) {
    return;
  }

  return Promise.all(
    options.notifications.map(({dayName, time}) =>
      browser.alarms.create(
        `${dayName} ${time}`,
        {
          when: getWeekDate(new Date(), dayName, time).getTime(),
          periodInMinutes: 7 * 24 * 60, // One week
        }
      )
    )
  )
}

function getWeekDate(baseDate, dayName, time) {
  const [hh, mm] = time.split(':');
  const date = new Date(baseDate);

  date.setHours(Number(hh));
  date.setMinutes(Number(mm));
  date.setSeconds(0);
  date.setMilliseconds(0);

  const currentDayIndex = date.getDay();
  const newDayIndex = (DAY_NAMES.indexOf(dayName) + 1) % DAY_NAMES.length;
  date.setDate(date.getDate() - (currentDayIndex - newDayIndex));

  return date;
}

async function getWeekOrders(date) {
  const data = await getData();
  const orderedDishes = data.orderedDishes || {};
  const orders = orderedDishes.list || [];

  return getWeekDays(date)
    .map(weekDate => {
      return orders.find(order => isSameDay(weekDate, new Date(order.date)));
    });
}

function isSameDay(dateOne, dateTwo) {
  return dateOne.getFullYear() === dateTwo.getFullYear()
    && dateOne.getMonth() === dateTwo.getMonth()
    && dateOne.getDate() === dateTwo.getDate();
}

function getWeekDays() {
  const monday = getWeekDate(new Date(), DAY_NAMES[0], '00:00');
  return new Array(7)
    .fill(null)
    .map((_, weekDayIndex) => {
      const newDate = new Date(monday);
      newDate.setDate(monday.getDate() + weekDayIndex);
      return newDate;
    });
}
