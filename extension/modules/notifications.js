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

  const currentDayIndex = (date.getDay() + 6) % 7;
  const newDayIndex = DAY_NAMES.indexOf(dayName);
  date.setDate(date.getDate() - (currentDayIndex - newDayIndex));

  return date;
}

async function getWorkingWeekOrders(date) {
  const data = await getData();
  const orderedDishes = data.orderedDishes || {};
  const updatedDate = orderedDishes.updatedDate;
  const orders = orderedDishes.list || [];
  const ordersPerDay = getWorkingWeekDays(date)
    .map(weekDate => orders.find(order => isSameDay(weekDate, new Date(order.date))));

  return {updatedDate, ordersPerDay};
}

function isSameDay(dateOne, dateTwo) {
  return dateOne.getFullYear() === dateTwo.getFullYear()
    && dateOne.getMonth() === dateTwo.getMonth()
    && dateOne.getDate() === dateTwo.getDate();
}

function getWorkingWeekDays(date) {
  const monday = getWeekDate(date, DAY_NAMES[0], '00:00');
  console.log('Function: getWorkingWeekDays,', 'Line: 58,', 'Type:', typeof monday, '\n', "monday:",
    monday
  );
  return new Array(5)
    .fill(null)
    .map((_, weekDayIndex) => {
      const newDate = new Date(monday);
      newDate.setDate(monday.getDate() + weekDayIndex);
      return newDate;
    });
}
