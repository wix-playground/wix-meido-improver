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
          when: createDate(dayName, time).getTime(),
          periodInMinutes: 7 * 24 * 60, // One week
        }
      )
    )
  )
}

function createDate(dayName, time) {
  const [hh, mm] = time.split(':');
  const date = new Date();

  date.setHours(Number(hh));
  date.setMinutes(Number(mm));
  date.setSeconds(0);
  date.setMilliseconds(0);

  const currentDayIndex = date.getDay();
  const newDayIndex = (DAY_NAMES.indexOf(dayName) + 1) % DAY_NAMES.length;
  date.setDate(date.getDate() - (currentDayIndex - newDayIndex));

  return date;
}
