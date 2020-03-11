import * as React from 'react';
import {WORKING_DAYS} from "../../../modules/notifications";
import {OrdersContext} from "../../context/OrdersContext";
import {LoadingContext} from "../../context/LoadingContext";
import {RpcContext} from "../../context/RpcContext";
import styles from './RepeatAllOrders.module.scss';
import {isLessFriday3pm} from "../Order";

export const RepeatAllOrders: React.FC = () => {
  const {repeatOrder} = React.useContext(RpcContext);
  const {loading} = React.useContext(LoadingContext);
  const {weekOrders, nextWeekOrders} = React.useContext(OrdersContext);

  const daysToRepeat = WORKING_DAYS.filter(workingDay => {
    const haveOrder = weekOrders && weekOrders[workingDay];
    const haveNextWeekOrder = nextWeekOrders && nextWeekOrders[workingDay];
    return haveOrder && !haveNextWeekOrder
  });

  const showRepeat = daysToRepeat.length > 0 && isLessFriday3pm(new Date());

  return !showRepeat || loading
    ? null
    : (
      <div className={styles.repeatAllOrdersWrapper}>
        <button className={styles.repeatAllOrders} onClick={() => {
          daysToRepeat
            .map(day => weekOrders && weekOrders[day])
            .filter(Boolean)
            .map(repeatOrder)
        }}>
          Repeat all
        </button>
      </div>
    );
};
