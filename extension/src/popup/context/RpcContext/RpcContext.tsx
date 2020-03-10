import * as React from 'react';
import {makeOrder} from "../../makeOrder";
import {tryRemoveOrder} from "../../removeOrder";
import {LoadingContext} from "../LoadingContext";
import {IDishOrder} from "../../../modules/localStorage";
import {getDateByDayIndex, getWeekDay, getWeekDayIndex} from "../../../modules/notifications";
import {MessageContext} from "../MessagesContext";


interface IRpcContext {
  repeatOrder: (order: IDishOrder) => void;
  removeOrder: (order: IDishOrder) => void;
}

export const RpcContext = React.createContext<IRpcContext>({
  repeatOrder: () => void 0,
  removeOrder: () => void 0,
});

export function RpcContextProvider({children}: { children: React.ReactNode }) {
  const {startRemoving, stopRemoving, startOrdering, stopOrdering} = React.useContext(LoadingContext);
  const {showError, hideError, showStatus} = React.useContext(MessageContext);

  return (
    <RpcContext.Provider value={{
      repeatOrder: async (order: IDishOrder) => {
        hideError();
        const {orderId, contractorName, dishId} = order;
        const date = new Date(order.date);
        const day = getWeekDay(new Date(date));
        startOrdering(orderId, day);

        const weekDayIndex = getWeekDayIndex(date);
        const nextWeekDay = getDateByDayIndex(new Date(), weekDayIndex);
        nextWeekDay.setDate(nextWeekDay.getDate() + 7);
        try {
          await makeOrder(nextWeekDay, contractorName, dishId, showStatus);
        } catch (error) {
          showError(error);
        } finally {
          stopOrdering(orderId, day);
        }
      },
      removeOrder: async ({orderId, dishId}: IDishOrder) => {
        hideError();
        startRemoving(orderId);
        try {
          await tryRemoveOrder(orderId, dishId, showStatus);
        } catch (error) {
          showError(error);
        } finally {
          stopRemoving(orderId);
        }
      }
    }}>
      {children}
    </RpcContext.Provider>
  )
}
