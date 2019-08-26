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
