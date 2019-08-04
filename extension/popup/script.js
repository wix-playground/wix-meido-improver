const button = document.getElementById('openOptions');
button.addEventListener('click', event => {
  event.preventDefault();
  browser.runtime.openOptionsPage();
});


let weekIndexToShow = 0;
const ordersElem = document.getElementById('orders');
const thisWeekElem = document.getElementsByClassName('this-week')[0];
const updateDateElem = document.getElementsByClassName('updated-date')[0];
const notLoadedElem = document.getElementsByClassName('not-loaded')[0];

(async () => {
  document.getElementsByClassName('prev-week')[0]
    .addEventListener('click', async () => {
      weekIndexToShow--;
      await render();
    });

  document.getElementsByClassName('next-week')[0]
    .addEventListener('click', async () => {
      weekIndexToShow++;
      await render();
    });

  thisWeekElem
    .addEventListener('click', async () => {
      weekIndexToShow = 0;
      await render();
    });

  subscribeForStorageChanges(() => render());
  await render();
})();


async function render() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + (weekIndexToShow * 7));
  const {ordersPerDay, updatedDate} = await getWorkingWeekOrders(startDate);

  ordersElem.innerText = '';
  updateDateElem.innerText = '';
  notLoadedElem.style.display = updatedDate ? 'none' : 'block';
  thisWeekElem.classList.toggle('yes', weekIndexToShow === 0);

  if (!updatedDate) {
    return;
  }

  updateDateElem.innerText = 'Updated: ' + new Date(updatedDate).toLocaleString();

  ordersPerDay.forEach((order, weekDayIndex) => {
    let date;
    if (order && order.date) {
      date = new Date(order.date);
    } else {
      date = startDate;
      date.setDate(date.getDate() + weekDayIndex);
    }

    const weekElem = createWeekElem(
      date,
      order && order.dishName,
      order && order.contractorName
    );
    weekElem.classList.toggle('today', isSameDay(new Date(date), new Date()));
    ordersElem.appendChild(weekElem);
  })
}

function createWeekElem(date, dishName, contractorName) {
  const weekElem = document.createElement('div');
  weekElem.className = 'week';
  weekElem.innerHTML = `
    <div class="week__name">
      <div class="name">${escapeHtml(getWeekName(date))}</div>
      <div class="day">${escapeHtml(getDayName(date))}</div>
    </div>
    <div class="week__order">
      <div>
        <div class="order">${dishName ? escapeHtml(dishName) : '<i>No order</i>'}</div>
        <div class="contractor">${escapeHtml(contractorName || '')}</div>
      </div>
    </div>
  `;
  return weekElem;
}


function getWeekName(date) {
  const dayNumber = date.getDay();
  const dayIndex = (dayNumber + 6) % 7;
  return DAY_NAMES[dayIndex].substr(0, 3);
}

function getDayName(date) {
  const monthIndex = date.getMonth();
  const monthName = MONTH_NAMES[monthIndex].substr(0, 3);
  return date.getDate() + ' ' + monthName;
}
