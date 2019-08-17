import {
  callInQueue,
  isLoggedIn,
  openContractor,
  clickOneClickBuy,
  confirmOrder,
  callRefreshOrderedDishesCache,
} from './rpcClient';
import { DishId } from '../modules/database';

export async function makeOrder(newDate: Date, contractorName: string, dishId: DishId): Promise<void> {
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
const loadingButtonsListeners = [];

export function isLoadingButton(weekDayIndex: number): boolean {
  return !!loadingButtons[weekDayIndex];
}

export function startLoadingButton(weekDayIndex: number, button: HTMLButtonElement): void {
  toggleLoadingButton(weekDayIndex, button, true);
}

export function stopLoadingButton(weekDayIndex: number, button: HTMLButtonElement): void {
  toggleLoadingButton(weekDayIndex, button, false);
}

export function subscribeForLoadingButtonChanges(fn: () => void): void {
  loadingButtonsListeners.push(fn);
}

function toggleLoadingButton(weekDayIndex: number, button: HTMLButtonElement, loading: boolean): void {
  if (loading) {
    loadingButtons[weekDayIndex] = true;
  } else {
    delete loadingButtons[weekDayIndex];
  }
  button.classList.toggle('spinning', loading);
  button.disabled = loading;
  loadingButtonsListeners.forEach(listener => listener());
}
