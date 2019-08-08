async function makeOrder(newDate, contractorName, dishId) {
  await callInQueue(async () => {
    if (!await isLoggedIn()) {
      throw new Error('Open Meido to login');
    }

    try {
      await openContractor(contractorName);
      await clickOneClickBuy(dishId);
      await confirmOrder(newDate);
    } catch (error) {
      throw error;
    } finally {
      await callRefreshOrderedDishesCache();
    }
  });
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
