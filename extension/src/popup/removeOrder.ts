import { callInQueue, isLoggedIn, removeOrder, callRefreshOrderedDishesCache } from './rpcClient';
import { DishId } from '../modules/database';

export async function tryRemoveOrder(orderId: string, dishId: DishId): Promise<void> {
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
const removingButtonsListener = [];

export function isRemovingButton(orderId: string): boolean {
  return !!removingButtons[orderId];
}

export function startRemovingButton(orderId: string, button: HTMLButtonElement): void {
  toggleRemovingLoadingButton(orderId, button, true);
}

export function stopRemovingButton(orderId: string, button: HTMLButtonElement): void {
  toggleRemovingLoadingButton(orderId, button, false);
}

export function subscribeForRemovingLoadingButtonChanges(fn: () => void): void {
  removingButtonsListener.push(fn);
}

function toggleRemovingLoadingButton(orderId: string, button: HTMLButtonElement, loading: boolean): void {
  if (loading) {
    removingButtons[orderId] = true;
  } else {
    delete removingButtons[orderId];
  }
  button.classList.toggle('spinning', loading);
  button.disabled = loading;
  removingButtonsListener.forEach(listener => listener());
}
