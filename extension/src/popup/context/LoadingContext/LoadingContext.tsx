import * as React from 'react';
import {IWorkingWeek} from "../../../modules/notifications";


interface ILoadingContext {
  startRemoving: (orderId: string) => void;
  stopRemoving: (orderId: string) => void;
  isRemoving: (orderId: string) => boolean;
  loading: boolean;
  startOrdering: (orderId: string, weekDay: keyof IWorkingWeek<null>) => void;
  stopOrdering: (orderId: string, weekDay: keyof IWorkingWeek<null>) => void;
  isOrdering: (orderId: string) => boolean;
  isOrderingInDay: (weekDay: keyof IWorkingWeek<null>) => boolean;
}

export const LoadingContext = React.createContext<ILoadingContext>({
  startRemoving: () => undefined,
  stopRemoving: () => undefined,
  isRemoving: () => false,
  loading: false,
  startOrdering: () => undefined,
  stopOrdering: () => undefined,
  isOrdering: () => false,
  isOrderingInDay: () => false,
});

const startFinishReducer: React.Reducer<{ [key: string]: boolean }, { type: 'start' | 'finish', key: string }> = (state, {type, key}) => {
  return {...state, [key]: type === 'start'};
};

export function LoadingContextProvider({children}: { children: React.ReactNode }) {
  const [removingState, dispatchRemovingState] = React.useReducer(startFinishReducer, {});
  const [orderingState, dispatchOrderingState] = React.useReducer(startFinishReducer, {});
  const [orderingDayState, dispatchOrderingDayState] = React.useReducer(startFinishReducer, {
    friday: false,
    monday: false,
    thursday: false,
    tuesday: false,
    wednesday: false
  });

  return (
    <LoadingContext.Provider value={{
      startRemoving: orderId => dispatchRemovingState({type: 'start', key: orderId}),
      stopRemoving: orderId => dispatchRemovingState({type: 'finish', key: orderId}),
      isRemoving: orderId => removingState[orderId],
      loading: [...Object.values(removingState), ...Object.values(orderingState), ...Object.values(orderingDayState)].some(Boolean),
      startOrdering: (orderId, weekDay) => {
        dispatchOrderingState({type: "start", key: orderId});
        dispatchOrderingDayState({type: "start", key: weekDay});
      },
      stopOrdering: (orderId, weekDay) => {
        dispatchOrderingState({type: "finish", key: orderId});
        dispatchOrderingDayState({type: "finish", key: weekDay});
      },
      isOrdering: orderId => orderingState[orderId],
      isOrderingInDay: weekDay => orderingDayState[weekDay],
    }}>
      {children}
    </LoadingContext.Provider>
  )
}
