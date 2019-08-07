async function makeOrder(newDate, contractorName, dishId) {
  await callInQueue(async () => {
    if (!await isLoggedIn()) {
      throw new Error('Open Meido to login');
    }

    await openContractor(contractorName);
    await clickOneClickBuy(dishId);
    await confirmOrder(newDate);
    await waitNewWeekOrderData(newDate);
  });
}

async function waitNewWeekOrderData(date) {
  const weekDayIndex = getWeekDayIndex(date);
  const {nextWeekOrdersPerDay, orderedDishesInvalidated} = await getWorkingWeekOrders(new Date());
  return new Promise((resolve, reject) => {
    if (orderedDishesInvalidated) {
      setTimeout(() => resolve(waitNewWeekOrderData(date)), 200);
    } else {
      if (!nextWeekOrdersPerDay[weekDayIndex]) {
        return reject(new Error('Can\'t find the new created order. Please, check orders list on wix.getmeido.com website'));
      }

      return resolve();
    }
  })
}


const loadingButtons = {};

function isLoadingButton(weekDayIndex) {
  return !!loadingButtons[weekDayIndex];
}

function startLoadingButton(weekDayIndex, button) {
  loadingButtons[weekDayIndex] = true;
  button.classList.add('spinning');
  button.disabled = true;
}

function stopLoadingButton(weekDayIndex, button) {
  delete loadingButtons[weekDayIndex];
  button.classList.remove('spinning');
  button.disabled = false;
}
