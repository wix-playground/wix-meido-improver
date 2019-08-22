import * as React from 'react';
import {
  getDateByDay,
  getDateByWeekIndex,
  getWeekDayIndex,
  isSameDay,
  IWorkingDay
} from "../../../modules/notifications";
import {DAY_NAMES, MONTH_NAMES} from "../../../options/storage";
import {default as cs} from 'classnames';
import styles from './Order.module.scss';
import {IDishOrder} from "../../../modules/localStorage";
import {OrdersContext} from "../../context/OrdersContext";

interface OrderProps {
  isToday: boolean;
  showRepeat: boolean;
  showRemove: boolean;
  date: Date,
  dishName: string,
  contractorName: string
}


const Order2: React.FunctionComponent<OrderProps> = ({date, dishName, contractorName, isToday, showRepeat, showRemove}: OrderProps) => {
  return (
    <div className={cs(styles.week, {[styles.today]: isToday})}>
      <div className={styles.week__name}>
        <div className={styles.name}>{date && getWeekName(date)}</div>
        <div className={styles.day}>{date && getDayName(date)}</div>
      </div>
      <div className={styles.week__order}>
        <div>
          <div className={styles.order}>{dishName || <i>No order</i>}</div>
          <div className={styles.contractor}>{contractorName}</div>
        </div>
      </div>
      {showRepeat && (
        <div className={styles.week__repeat}>
          <button className={styles.repeat} title="Repeat this order for the next week">&nbsp;</button>
        </div>
      )}
      {showRemove && (
        <div className={styles.week__remove}>
          <button className={styles.remove} title="Remove order">&nbsp;</button>
        </div>
      )}
    </div>
  )
};

interface IOrderInnerProps {
  order?: IDishOrder;
  forDate: Date;
  showRepeat: boolean;
  showRemove: boolean;
  onRepeat: (order: IDishOrder) => void;
  onRemove: (order: IDishOrder) => void;
}

const OrderInner = ({order, forDate, showRepeat, showRemove}: IOrderInnerProps) => {
  if (!order) {
    return (
      <Order2
        isToday={false}
        showRepeat={false}
        showRemove={false}
        date={forDate}
        dishName={''}
        contractorName={''}
      />
    );
  }

  const {dishName, contractorName} = order || {dishName: '', contractorName: ''};
  const date = new Date(order.date);
  const now = new Date();

  return (
    <Order2
      date={date}
      isToday={isSameDay(date, now)}
      dishName={dishName}
      contractorName={contractorName}
      showRepeat={showRepeat}
      showRemove={showRemove}
    />
  )
};

function getWeekName(date: Date): string {
  const dayIndex = getWeekDayIndex(date);
  return DAY_NAMES[dayIndex].substr(0, 3);
}

function getDayName(date: Date): string {
  const monthIndex = date.getMonth();
  const monthName = MONTH_NAMES[monthIndex].substr(0, 3);
  return date.getDate() + ' ' + monthName;
}

function isLessFriday3pm(date: Date) {
  const friday3pm = getDateByDay(new Date(), 'friday', '15:00');
  return date <= friday3pm;
}

export const Order = ({day}: { day: IWorkingDay }) => (
  <OrdersContext.Consumer>
    {({weekOrders, weekIndex, nextWeekOrders}) => {
      const date = getDateByWeekIndex(weekIndex, day);
      const order: IDishOrder | undefined = (weekOrders && weekOrders[day]) || undefined;

      const hasNextWeekOrder = !nextWeekOrders || nextWeekOrders[day] !== null;
      const showRepeat = order
        ? !hasNextWeekOrder && isLessFriday3pm(new Date())
        : false;
      const showRemove = order
        ? new Date < getDateByDay(date, 'friday', '15:00')
        : false;

      return (
        <OrderInner
          order={order}
          forDate={date}
          showRepeat={showRepeat}
          showRemove={showRemove}
          onRepeat={() => void 0}
          onRemove={() => void 0}
        />
      );
    }}
  </OrdersContext.Consumer>
);
