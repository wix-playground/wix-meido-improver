import * as React from 'react';
import {getWeekDayIndex} from "../../../modules/notifications";
import {DAY_NAMES, MONTH_NAMES} from "../../../options/storage";
import * as cs from 'classnames';
import styles from './Week.module.scss';

interface WeekProps {
  isToday: boolean;
  showRepeatButton: boolean;
  showRemoveButton: boolean;
  date: Date,
  dishName: string,
  contractorName: string
}

export const Week: React.FunctionComponent<WeekProps> = ({date, dishName, contractorName, isToday, showRepeatButton, showRemoveButton}: WeekProps) => {
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
      {showRepeatButton && (
        <div className={styles.week__repeat}>
          <button className={styles.repeat} title="Repeat this order for the next week">&nbsp;</button>
        </div>
      )}
      {showRemoveButton && (
        <div className={styles.week__remove}>
          <button className={styles.remove} title="Remove order">&nbsp;</button>
        </div>
      )}
    </div>
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
