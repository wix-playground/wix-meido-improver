import * as React from 'react';
import styles from './Footer.module.scss';

export const Footer = () => {
  return (
    <div className={styles.buttons}>
      <a className={styles.openOptions}>Preferences</a>
      <a href="https://wix.getmeido.com/order" target="_blank">Open Meido</a>
    </div>
  )
};
