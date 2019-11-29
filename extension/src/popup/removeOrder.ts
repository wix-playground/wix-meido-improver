import { callInQueue, isLoggedIn, removeOrder, callRefreshOrderedDishesCache } from './rpcClient';
import { DishId } from '../modules/database';

export async function tryRemoveOrder(
  orderId: string,
  dishId: DishId,
  showStatus: (status: string | null) => void
): Promise<void> {
  const setStatus = (status: string | null) => showStatus(status && `[Delete ${orderId}] ${status}`);

  await callInQueue(async () => {
    setStatus(`Checking authentication`);
    if (!(await isLoggedIn())) {
      setStatus(null);
      throw new Error('Open Meido to login');
    }

    try {
      setStatus(`Removing`);
      await removeOrder(orderId, dishId);
    } catch (error) {
      throw error;
    } finally {
      setStatus(`Updating cache`);
      await callRefreshOrderedDishesCache();
      setStatus(null);
    }
  });
}
