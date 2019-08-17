import * as React from 'react';
import {getData, IDishOrder, IUserData, subscribeForStorageChanges} from "../../../modules/localStorage";
import {filterWorkingWeekOrders, IWorkingWeek, IWorkingWeekDishOrders} from "../../../modules/notifications";


interface ILoadingState {
  removing: {
    [key: string]: boolean
  },
  ordering: {
    [key: string]: boolean
  },
  orderingDay: IWorkingWeek<boolean>
}

interface IOrdersContext {
  startRemoving: (orderId: string) => void;
  stopRemoving: (orderId: string) => void;
  isRemoving: (orderId: string) => boolean;
  startOrdering: (orderId: string, weekDay: keyof IWorkingWeek<null>) => void;
  stopOrdering: (orderId: string, weekDay: keyof IWorkingWeek<null>) => void;
  isOrdering: (orderId: string) => boolean,
  isOrderingInDay: (weekDay: keyof IWorkingWeek<null>) => boolean,
}

export const LoadingContext = React.createContext<IOrdersContext>({
  startRemoving: () => undefined,
  stopRemoving: () => undefined,
  isRemoving: () => false,
  startOrdering: () => undefined,
  stopOrdering: () => undefined,
  isOrdering: ()=> false,
  isOrderingInDay: ()=> false,
});

export function LoadingContextProvider({children}) {
  const [removingState, setRemovingState] = React.useState<{ [key: string]: boolean }>({});
  const [orderingState, seOrderingState] = React.useState<{ [key: string]: boolean }>({});
  const [orderingDayState, seOrderingDayState] = React.useState<{ [key: string]: boolean }>({
    friday: false,
    monday: false,
    thursday: false,
    tuesday: false,
    wednesday: false
  });

  return (
    <LoadingContext.Provider value={{
      startRemoving: orderId => setRemovingState({[orderId]: true}),
      stopRemoving: orderId => setRemovingState({[orderId]: false}),
      isRemoving: orderId => !!removingState[orderId],
      startOrdering: (orderId, weekDay) => {
        seOrderingState({[orderId]: true});
        seOrderingDayState({[weekDay]: true});
      },
      stopOrdering: (orderId, weekDay) => {
        seOrderingState({[orderId]: false});
        seOrderingDayState({[weekDay]: false});
      },
      isOrdering: orderId => !!orderingState[orderId],
      isOrderingInDay: weekDay => !!orderingDayState[weekDay],
    }}>
      {children}
    </LoadingContext.Provider>
  )
}
