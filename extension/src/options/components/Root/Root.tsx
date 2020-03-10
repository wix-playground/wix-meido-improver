import * as React from "react";
import {Footer} from "../Footer";
import {Form} from "../Form/Form";
import img from '../../../../static/icons/icon48.png';
import styles from './Root.module.scss';

export const Root = () => (
  <React.Fragment>
    <div className={styles.title}>
      <img src={img} alt="Wix-Meido-Improver Logo"/>
      <h3>When do you want to be notified about missing orders for the next week?</h3>
    </div>

    <p className={styles.warning}>
      Orders for the next week are processed until Friday 15:00
    </p>

    <Form/>
    <Footer/>
  </React.Fragment>
);
