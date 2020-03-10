import * as React from 'react';
import {Order} from "../Order";
import {Header} from "../Header";
import {Footer} from "../Footer";
import {RepeatAllOrders} from "../RepeatAllOrders";
import {MessageContext} from "../../context/MessagesContext";
import {OrdersContext} from "../../context/OrdersContext";
import styles from './Root.module.scss';

export const Root = () => {
  const {errorMessage, statusMessage} = React.useContext(MessageContext);
  const {updatedDate} = React.useContext(OrdersContext);
  return (
    <React.Fragment>
      <Header/>

      <div className={styles.orders}>
        {updatedDate === null
          ? (<div className={styles.notLoaded}>
              <a href="https://wix.getmeido.com/order" target="_blank" className={styles.link}>
                Open Meido to load data
              </a>
            </div>
          )
          : (
            <React.Fragment>
              <Order day={'monday'}/>
              <Order day={'tuesday'}/>
              <Order day={'wednesday'}/>
              <Order day={'thursday'}/>
              <Order day={'friday'}/>
            </React.Fragment>
          )}
      </div>
      <RepeatAllOrders/>

      {statusMessage !== null && <div className={styles.warning}>{statusMessage}</div>}
      {errorMessage !== null && <div className={styles.error}>{errorMessage}</div>}

      <Footer/>
    </React.Fragment>
  )
};
