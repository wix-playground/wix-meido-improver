import {
  callInQueue,
  isLoggedIn,
  openContractor,
  clickOneClickBuy,
  confirmOrder,
  callRefreshOrderedDishesCache,
} from './rpcClient';

export async function makeOrder(newDate, contractorName, dishId) {
  await callInQueue(async () => {
    if (!(await isLoggedIn())) {
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

export function isLoadingButton(weekDayIndex) {
  return !!loadingButtons[weekDayIndex];
}

export function startLoadingButton(weekDayIndex, button) {
  loadingButtons[weekDayIndex] = true;
  button.classList.add('spinning');
  button.disabled = true;
}

export function stopLoadingButton(weekDayIndex, button) {
  delete loadingButtons[weekDayIndex];
  button.classList.remove('spinning');
  button.disabled = false;
}
