import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import styles from './Footer.module.scss';

export const Footer = () => {
  return (
    <div className={styles.buttons}>
      <a className={styles.openOptions} onClick={() => browser.runtime.openOptionsPage()}>Preferences</a>
      <a href="https://wix.getmeido.com/order" target="_blank">Open Meido</a>
    </div>
  )
};
