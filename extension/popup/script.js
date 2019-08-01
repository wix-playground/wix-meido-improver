const button = document.getElementById('openOptions');
button.addEventListener('click', event => {
  event.preventDefault();
  browser.runtime.openOptionsPage();
});


(async () => {
  const {ordersPerDay, updatedDate} = await getWorkingWeekOrders(new Date());
  const updateDateElem = document.getElementsByClassName('updated-date')[0];

  if (updatedDate) {
    updateDateElem.innerText = 'Updated: ' + new Date(updatedDate).toLocaleString();
    updateDateElem.classList.remove('not-loaded');

    ordersPerDay.forEach((order, weekDayIndex) => {
      const weekElem = document.getElementById('week-' + weekDayIndex);
      const orderElem = weekElem.getElementsByClassName('order')[0];
      const contractorElem = weekElem.getElementsByClassName('contractor')[0];

      if (order) {
        orderElem.innerText = order.dishName;
        contractorElem.innerText = order.contractorName;
        weekElem.classList.toggle('today', isSameDay(new Date(order.date), new Date()));
      }
    })
  } else {
    document.getElementById('orders').style.display = 'none';
  }
})();
