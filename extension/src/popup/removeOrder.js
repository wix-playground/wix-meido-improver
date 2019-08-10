import { callInQueue, isLoggedIn, removeOrder, callRefreshOrderedDishesCache } from './rpcClient';

export async function tryRemoveOrder(orderId, dishId) {
  await callInQueue(async () => {
    if (!(await isLoggedIn())) {
      throw new Error('Open Meido to login');
    }
    try {
      await removeOrder(orderId, dishId);
    } catch (error) {
      throw error;
    } finally {
      await callRefreshOrderedDishesCache();
    }
  });
}

const removingButtons = {};

export function isRemovingButton(orderId) {
  return !!removingButtons[orderId];
}

export function startRemovingButton(orderId, button) {
  removingButtons[orderId] = true;
  button.classList.add('spinning');
  button.disabled = true;
}

export function stopRemovingButton(orderId, button) {
  delete removingButtons[orderId];
  button.classList.remove('spinning');
  button.disabled = false;
}
