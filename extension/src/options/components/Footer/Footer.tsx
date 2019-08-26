import * as React from "react";
import {resetOptions} from "../../storage";
import {clearData} from "../../../modules/localStorage";
import styles from './Footer.module.scss';

export const Footer = () => (
  <p className={styles.buttons}>
    <button
      onClick={async () => {
        await resetOptions();
        location.reload(true);
      }}
    >
      Reset to defaults
    </button>

    <button onClick={() => clearData()}>
      Clear cache
    </button>
  </p>
);
