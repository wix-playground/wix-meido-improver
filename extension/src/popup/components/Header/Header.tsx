import * as React from 'react';
import {default as cs} from 'classnames';
import styles from './Header.module.scss';
import {OrdersContext} from "../../context/OrdersContext";
import img from '../../../../static/icons/icon48.png';
import {FormattedRelativeTime} from 'react-intl'

type IUnit = 'day' | 'hour' | 'minute' | 'second';

function bestUnit(date: Date): { unit: IUnit, value: number } {
  const ms = Date.now() - date.getTime();

  const v: { unit: IUnit, diff: number }[] = [
    {unit: 'day', diff: 24 * 60 * 60 * 1000},
    {unit: 'hour', diff: 60 * 60 * 1000},
    {unit: 'minute', diff: 60 * 1000},
  ];

  const {unit, diff} = v.find(({diff}) => ms / diff > 1) || v[v.length - 1];
  return {
    unit,
    value: -1 * Math.ceil(ms / diff)
  }
}

const RelativeTime = ({date}: { date: Date }) => {
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
      <FormattedRelativeTime style={"long"} {...bestUnit(date)}/>
    </time>
  );
};

export const Header = () => {
  const {setWeekIndex, weekIndex, updatedDate} = React.useContext(OrdersContext);

  return (
    <div className={styles.title}>
      <div className={styles.weekButtonWrapper}>
        <button
          className={cs(styles.weekButton, {[styles.active]: weekIndex === 0})}
          onClick={() => setWeekIndex(0)}
        >
          This week
        </button>
        <button
          className={cs(styles.weekButton, {[styles.active]: weekIndex === 1})}
          onClick={() => setWeekIndex(1)}
        >
          The next week
        </button>
      </div>
      <button
        className={`${styles.nextPrevWeek} ${styles.prevWeek}`}
        title="Previous week"
        onClick={() => setWeekIndex(weekIndex - 1)}
      />
      <div className={styles.titleText}>
        <img className={styles.img} src={img} alt="extension icon"/>
        <div>
          Your orders for week
          <br/>
          {updatedDate !== null && (
            <div className={styles.updatedDate}>
              Last update
              &nbsp;
              <RelativeTime date={updatedDate}/>
            </div>
          )}
        </div>
      </div>

      <button
        className={styles.nextPrevWeek}
        title="Next week"
        onClick={() => setWeekIndex(weekIndex + 1)}
      />
    </div>
  )
};
