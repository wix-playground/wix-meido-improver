import {
  callInQueue,
  isLoggedIn,
  openContractor,
  clickOneClickBuy,
  confirmOrder,
  callRefreshOrderedDishesCache,
} from './rpcClient';
import { DishId } from '../modules/database';

export async function makeOrder(
  newDate: Date,
  contractorName: string,
  dishId: DishId,
  showStatus: (status: string | null) => void
): Promise<void> {
  const setStatus = (status: string | null) => showStatus(status && `[${newDate.toDateString()}] ${status}`);

  await callInQueue(async () => {
    setStatus(`Checking authentication`);
    if (!(await isLoggedIn())) {
      setStatus(null);
      throw new Error('Open Meido to login');
    }

    try {
      setStatus(`Opening contractor "${contractorName}"`);
      await openContractor(contractorName);

      setStatus(`Add dish "${dishId}" to shopping cart`);
      await clickOneClickBuy(dishId);

      setStatus(`Confirming order`);
      await confirmOrder(newDate);
    } catch (error) {
      throw error;
    } finally {
      setStatus(`Updating cache`);
      await callRefreshOrderedDishesCache();
      setStatus(null);
    }
  });
}
