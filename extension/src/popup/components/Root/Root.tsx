import * as React from 'react';
import {getWeekDayIndex, weekToList} from "../../../modules/notifications";
import {DAY_NAMES, MONTH_NAMES} from "../../../options/storage";
import * as cs from 'classnames';
import styles from './Root.module.scss';
import {Week} from "../Week";
import {OrdersContext} from "../../context/OrdersContext";

export const Root = () => {
  const {weekOrders, setWeekIndex, weekIndex} = React.useContext(OrdersContext);

  return (
    <React.Fragment>
      <div className={styles.title}>
        <div className={styles.weekButtonWrapper}>
          <button className={styles.weekButton} id="this-week" onClick={() => setWeekIndex(0)}>This week</button>
          <button className={styles.weekButton} id="the-next-week" onClick={() => setWeekIndex(1)}>The next week</button>
        </div>
        <button id="prev-week" title="Previous week" onClick={() => setWeekIndex(weekIndex - 1)}>⮃</button>
        <div className={styles.titleText}>
          <img src="../../static/icons/icon48.png" alt="extension icon"/>
          <div>
            Your orders for week
            <br/>
            <div id="updated-date"></div>
            <div id="not-loaded">
              <a href="https://wix.getmeido.com/order" target="_blank">Open Meido</a> to load data
            </div>
          </div>
        </div>
        <button id="next-week" title="Next week" onClick={() => setWeekIndex(weekIndex + 1)}>⮁</button>
      </div>

      <div id="error"></div>
      <div id="warning"></div>

      <div id="orders">
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

      <div className={styles.buttons}>
        <a id="openOptions">Preferences</a>
        <a href="https://wix.getmeido.com/order" target="_blank">Open Meido</a>
      </div>
    </React.Fragment>
  )
};
