import * as React from "react";
import {clearData} from "../../../modules/localStorage";
import styles from './Footer.module.scss';

export const Footer = () => {
  return (
    <p className={styles.buttons}>
      <button onClick={() => clearData()}>
        Clear App Cache
      </button>
    </p>
  );
};
