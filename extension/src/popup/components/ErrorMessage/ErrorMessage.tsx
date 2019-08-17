import * as React from 'react';
import styles from './ErrorMessage.module.scss';

export const ErrorMessage = ({children}: {children: React.ReactNode}) => {
  return (
    <div className={styles.error}>{children}</div>
  )
};
