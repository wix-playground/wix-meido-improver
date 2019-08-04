const button = document.getElementById('openOptions');
button.addEventListener('click', event => {
  event.preventDefault();
  browser.runtime.openOptionsPage();
});


(async () => {
  subscribeForStorageChanges(() => render());
  await render();
})();


async function render() {
  const {ordersPerDay, updatedDate} = await getWorkingWeekOrders(new Date());
  const ordersElem = document.getElementById('orders');
  const updateDateElem = document.getElementsByClassName('updated-date')[0];
  const notLoadedElem = document.getElementsByClassName('not-loaded')[0];

  ordersElem.innerText = '';
  updateDateElem.innerText = '';
  notLoadedElem.style.display = updatedDate ? 'none' : 'block';

  if (!updatedDate) {
    return;
  }

  updateDateElem.innerText = 'Updated: ' + new Date(updatedDate).toLocaleString();

  ordersPerDay.forEach(order => {
    const date = new Date(order.date);
    const weekElem = createWeekElem(
      date,
      order && order.dishName,
      order && order.contractorName
    );
    weekElem.classList.toggle('today', isSameDay(new Date(order.date), new Date()));
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
        <div class="contractor">${escapeHtml(contractorName)}</div>
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
