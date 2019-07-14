const button = document.getElementById('openOptions');
button.addEventListener('click', event => {
  event.preventDefault();
  browser.runtime.openOptionsPage();
});


(async () => {
  const orders = await getWeekOrders();
  orders.slice(0, 5).forEach((order, weekDayIndex) => {
    const weekElem = document.getElementById('week-' + weekDayIndex);
    const orderElem = weekElem.getElementsByClassName('order')[0];
    const contractorElem = weekElem.getElementsByClassName('contractor')[0];

    if (order) {
      orderElem.innerText = order.dishName;
      contractorElem.innerText = order.contractorName;
      weekElem.classList.toggle('today', isSameDay(new Date(order.date), new Date()));
    }
  })
})();
