import * as React from 'react';
import * as cs from 'classnames';
import styles from './Header.module.scss';
import {OrdersContext} from "../../context/OrdersContext";
import img from '../../../../static/icons/icon48.png';


export const Header = () => {
  const {setWeekIndex, weekIndex} = React.useContext(OrdersContext);

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
        className={styles.nextPrevWeek}
        title="Previous week"
        onClick={() => setWeekIndex(weekIndex - 1)}>
        ⮃
      </button>
      <div className={styles.titleText}>
        <img className={styles.img} src={img} alt="extension icon"/>
        <div>
          Your orders for week
          <br/>
          <div className={styles.updatedDate}></div>
          <div className={styles.notLoaded}>
            <a href="https://wix.getmeido.com/order" target="_blank">Open Meido</a> to load data
          </div>
        </div>
      </div>

      <button
        className={styles.nextPrevWeek}
        title="Next week"
        onClick={() => setWeekIndex(weekIndex + 1)}>
        ⮁
      </button>
    </div>
  )
};
