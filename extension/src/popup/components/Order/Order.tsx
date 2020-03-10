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
import {IDishOrder} from "../../../modules/localStorage";
import {OrdersContext} from "../../context/OrdersContext";
import {LoadingContext} from "../../context/LoadingContext";
import {RpcContext} from "../../context/RpcContext";
import styles from './Order.module.scss';

interface OrderProps {
  isToday: boolean;
  showRepeat: boolean;
  showRemove: boolean;
  date: Date;
  dishName: string;
  contractorName: string;
  isRemoving: boolean;
  isOrdering: boolean;
  isDayOrdering: boolean;
  onRepeat: () => void;
  onRemove: () => void;
}


const Order2: React.FunctionComponent<OrderProps> = ({date, dishName, contractorName, isToday, showRepeat, showRemove, isOrdering, isDayOrdering, isRemoving, onRemove, onRepeat}: OrderProps) => {
  return (
    <div className={cs(styles.week, {[styles.today]: isToday})}>
      <div className={styles.week__name}>
        <div className={styles.name}>{date && getWeekName(date)}</div>
        <div className={styles.day}>{date && getDayName(date)}</div>
      </div>
      <div className={styles.week__order}>
        <div className={styles.dishName}>{dishName || <i>No order</i>}</div>
        <div className={styles.contractor}>{contractorName}</div>
      </div>
      {showRepeat && (
        <div className={styles.week__repeat}>
          <button
            className={cs(styles.repeat, {
              [styles.spinning]: isOrdering || isDayOrdering,
              [styles.onlyDayOrdering]: !isOrdering && isDayOrdering
            })}
            disabled={isOrdering || isDayOrdering}
            title="Repeat this order for the next week"
            onClick={() => onRepeat()}
          >
            &nbsp;
          </button>
        </div>
      )}
      {showRemove && (
        <div className={styles.week__remove}>
          <button
            className={cs(styles.remove, {[styles.spinning]: isRemoving})}
            disabled={isRemoving}
            title="Remove order"
            onClick={() => onRemove()}
          >
            &nbsp;
          </button>
        </div>
      )}
    </div>
  )
};

interface IOrderInnerProps {
  order: IDishOrder;
  showRepeat: boolean;
  showRemove: boolean;
  onRepeat: (order: IDishOrder) => void;
  onRemove: (order: IDishOrder) => void;
  isRemoving: boolean;
  isOrdering: boolean;
  isDayOrdering: boolean;
}

// TODO: combine OrderInner and Order2
const OrderInner = ({order, showRepeat, showRemove, isOrdering, isDayOrdering, isRemoving, onRemove, onRepeat}: IOrderInnerProps) => {
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
      isOrdering={isOrdering}
      isDayOrdering={isDayOrdering}
      isRemoving={isRemoving}
      onRemove={() => onRemove(order)}
      onRepeat={() => onRepeat(order)}
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

export function isLessFriday3pm(date: Date) {
  const friday3pm = getDateByDay(new Date(), 'friday', '15:00');
  return date <= friday3pm;
}

export const Order = ({day}: { day: IWorkingDay }) => {
  const {repeatOrder, removeOrder} = React.useContext(RpcContext);
  const {isRemoving, isOrdering, isOrderingInDay} = React.useContext(LoadingContext);
  const {weekOrders, weekIndex, nextWeekOrders} = React.useContext(OrdersContext);

  const date = getDateByWeekIndex(weekIndex, day);
  const order: IDishOrder | undefined = (weekOrders && weekOrders[day]) || undefined;
  const isToday = isSameDay(date, new Date());

  if (!order) {
    return (
      <Order2
        isToday={isToday}
        showRepeat={false}
        showRemove={false}
        date={date}
        dishName={''}
        contractorName={''}
        isOrdering={false}
        isDayOrdering={false}
        isRemoving={false}
        onRemove={() => void 0}
        onRepeat={() => void 0}
      />
    );
  }

  const hasNextWeekOrder = !nextWeekOrders || nextWeekOrders[day] !== null;
  const showRepeat = order
    ? !hasNextWeekOrder && isLessFriday3pm(new Date())
    : false;

  const prevFriday = getDateByDay(date, 'friday', '15:00');
  prevFriday.setDate(prevFriday.getDate() - 7);
  const showRemove = order
    ? new Date() < prevFriday
    : false;

  return (
    <OrderInner
      order={order}
      showRepeat={showRepeat}
      showRemove={showRemove}
      onRepeat={() => repeatOrder(order)}
      onRemove={() => removeOrder(order)}
      isRemoving={isRemoving(order.orderId)}
      isOrdering={isOrdering(order.orderId)}
      isDayOrdering={isOrderingInDay(day)}
    />
  );
};
