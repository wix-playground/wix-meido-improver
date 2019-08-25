import * as React from 'react';
import {Order} from "../Order";
import {Header} from "../Header";
import {Footer} from "../Footer";
import {MessageContext} from "../../context/MessagesContext";
import {LoadingContext} from "../../context/LoadingContext";
import styles from './Root.module.scss';
import {OrdersContext} from "../../context/OrdersContext";

export const Root = () => {
  const {errorMessage} = React.useContext(MessageContext);
  const {isSomethingLoading} = React.useContext(LoadingContext);
  const {updatedDate} = React.useContext(OrdersContext);
  return (
    <React.Fragment>
      <Header/>

      {errorMessage !== null
        ? <div className={styles.error}>{errorMessage}</div>
        : isSomethingLoading() && <div className={styles.warning}>Do not close this popup</div>
      }

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

      <Footer/>
    </React.Fragment>
  )
};
