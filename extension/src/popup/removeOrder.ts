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

export function isRemovingButton(orderId: string): boolean {
  return !!removingButtons[orderId];
}

export function startRemovingButton(orderId: string, button: HTMLButtonElement): void {
  removingButtons[orderId] = true;
  button.classList.add('spinning');
  button.disabled = true;
}

export function stopRemovingButton(orderId: string, button: HTMLButtonElement): void {
  delete removingButtons[orderId];
  button.classList.remove('spinning');
  button.disabled = false;
}
