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
