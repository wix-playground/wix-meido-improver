import * as React from 'react';
import {getWeekDayIndex, weekToList} from "../../../modules/notifications";
import {DAY_NAMES, MONTH_NAMES} from "../../../options/storage";
import * as cs from 'classnames';
import styles from './Root.module.scss';
import {Week} from "../Week";
import {OrdersContext} from "../../context/OrdersContext";
import {Header} from "../Header";
import {Footer} from "../Footer";

export const Root = () => {
  const {weekOrders} = React.useContext(OrdersContext);

  return (
    <React.Fragment>
      <Header/>

      <div id="error"></div>
      <div id="warning"></div>

      <div>
        {weekOrders && weekToList(weekOrders).map(order => (
          <Week
            isToday={false}
            showRepeatButton={true}
            showRemoveButton={true}
            date={order && new Date(order.date)} // TODO: move out cechking for !!order
            dishName={order && order.dishName}
            contractorName={order && order.contractorName}/>
        ))}
      </div>

      <Footer/>
    </React.Fragment>
  )
};
