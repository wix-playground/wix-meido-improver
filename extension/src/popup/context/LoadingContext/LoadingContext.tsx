import * as React from 'react';
import {IWorkingWeek} from "../../../modules/notifications";


interface ILoadingContext {
  startRemoving: (orderId: string) => void;
  stopRemoving: (orderId: string) => void;
  isRemoving: (orderId: string) => boolean;
  startOrdering: (orderId: string, weekDay: keyof IWorkingWeek<null>) => void;
  stopOrdering: (orderId: string, weekDay: keyof IWorkingWeek<null>) => void;
  isOrdering: (orderId: string) => boolean,
  isOrderingInDay: (weekDay: keyof IWorkingWeek<null>) => boolean,
}

export const LoadingContext = React.createContext<ILoadingContext>({
  startRemoving: () => undefined,
  stopRemoving: () => undefined,
  isRemoving: () => false,
  startOrdering: () => undefined,
  stopOrdering: () => undefined,
  isOrdering: () => false,
  isOrderingInDay: () => false,
});

export function LoadingContextProvider({children}: { children: React.ReactNode }) {
  const [removingState, setRemovingState] = React.useState<{ [key: string]: boolean }>({});
  const [orderingState, setOrderingState] = React.useState<{ [key: string]: boolean }>({});
  const [orderingDayState, setOrderingDayState] = React.useState<{ [key: string]: boolean }>({
    friday: false,
    monday: false,
    thursday: false,
    tuesday: false,
    wednesday: false
  });

  return (
    <LoadingContext.Provider value={{
      startRemoving: orderId => setRemovingState({...removingState, [orderId]: true}),
      stopRemoving: orderId => setRemovingState({...removingState, [orderId]: false}),
      isRemoving: orderId => !!removingState[orderId],
      startOrdering: (orderId, weekDay) => {
        setOrderingState({...orderingState, [orderId]: true});
        setOrderingDayState({...orderingDayState, [weekDay]: true});
      },
      stopOrdering: (orderId, weekDay) => {
        setOrderingState({...orderingState, [orderId]: false});
        setOrderingDayState({...orderingDayState, [weekDay]: false});
      },
      isOrdering: orderId => !!orderingState[orderId],
      isOrderingInDay: weekDay => !!orderingDayState[weekDay],
    }}>
      {children}
    </LoadingContext.Provider>
  )
}
