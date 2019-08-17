import * as React from 'react';
import {getData, IDishOrder, IUserData, subscribeForStorageChanges} from "../../../modules/localStorage";
import {filterWorkingWeekOrders, IWorkingWeekDishOrders} from "../../../modules/notifications";


interface IOrdersState {
  ordersList: IDishOrder[],
  updatedDateStr: string | null
  weekIndex: number,
}

interface IOrdersContext {
  updatedDate: Date | null,
  weekOrders: IWorkingWeekDishOrders | null,
  nextWeekOrders: IWorkingWeekDishOrders | null,
  weekIndex: number,
  setWeekIndex: (weekIndex: number) => void,
}

export const OrdersContext = React.createContext<IOrdersContext>({
  weekOrders: null,
  nextWeekOrders: null,
  updatedDate: null,
  weekIndex: 0,
  setWeekIndex: () => undefined,
});

export class OrdersContextProvider extends React.Component<{ children: React.ReactNode }, IOrdersState> {
  state = {
    ordersList: [],
    updatedDateStr: null,
    weekIndex: 0
  };

  componentDidMount(): void {
    subscribeForStorageChanges(this.onDataChange);

    // TODO: check if component is mounted;
    getData().then(data => this.setState(this.getStateFromUserData(data)));
  }

  onDataChange = (newData: IUserData) => {
    this.setState(this.getStateFromUserData(newData));
  };

  getStateFromUserData(data: IUserData): IOrdersState {
    const {weekIndex} = this.state;
    const {updatedDate, list} = data.orderedDishes || {list: [], updatedDate: null};

    return {updatedDateStr: updatedDate, ordersList: list, weekIndex};
  }

  render() {
    const {weekIndex, updatedDateStr, ordersList} = this.state;

    const currentWeek = new Date();
    currentWeek.setDate(currentWeek.getDate() + (7 * weekIndex));
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);


    return (
      <OrdersContext.Provider value={{
        weekOrders: filterWorkingWeekOrders(ordersList, currentWeek),
        nextWeekOrders: filterWorkingWeekOrders(ordersList, nextWeek),
        updatedDate: updatedDateStr === null ? null : new Date(updatedDateStr || ''), // TODO: remove `|| ''`
        weekIndex,
        setWeekIndex: weekIndex => this.setState({weekIndex})
      }}>
        {this.props.children}
      </OrdersContext.Provider>
    )
  }
}
