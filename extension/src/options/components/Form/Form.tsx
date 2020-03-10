import * as React from "react";
import {default as cs} from 'classnames';
import {DAY_NAMES, INotification} from "../../storage";
import {OptionsContext} from "../../context/OptionsContext";
import styles from './Form.module.scss';


export const Form = () => {
  const {options, setOptions, resetOptions} = React.useContext(OptionsContext);
  const [enableNotifications, setEnableNotifications] = React.useState<boolean>(options.enableNotifications);
  const [notifications, setNotifications] = React.useState<INotification[]>(options.notifications);
  const [showChangesSaved, setShowChangesSaved] = React.useState(false);

  const resetForm = (): void => {
    setEnableNotifications(options.enableNotifications);
    setNotifications(options.notifications);
  }

  React.useEffect(() => resetForm(), [JSON.stringify(options)]);

  function changeNotifications(index: number, newNotification: INotification): INotification[] {
    const newList = [...notifications];
    newList[index] = newNotification;
    return newList;
  }

  function changeNotificationDay(index: number, dayName: string) {
    setNotifications(changeNotifications(index, {...notifications[index], dayName}));
  }

  function changeNotificationTime(index: number, time: string) {
    setNotifications(changeNotifications(index, {...notifications[index], time}));
  }

  const showSaved = () => {
    // setEnableNotifications(options.enableNotifications);
    // setNotifications(options.notifications);
    setShowChangesSaved(true);
    setTimeout(() => setShowChangesSaved(false), 1000);
  };

  return (
    <form className={styles.form} onSubmit={async event => {
      event.preventDefault();
      await setOptions({enableNotifications, notifications});
      showSaved();
    }}>
      <p className={styles.enableNotificationsWrapper}>
        <label>
          <input
            type="checkbox"
            checked={enableNotifications}
            onChange={event => setEnableNotifications(event.target.checked)}
          />
          Enable notifications
        </label>
      </p>
      <table className={cs(styles.table, {[styles.notificationsEnabled]: enableNotifications})}>
        <thead>
        <tr>
          <th>Day</th>
          <th>Time</th>
          <th/>
        </tr>
        </thead>
        <tbody>
        {notifications.map(({dayName, time}, index) => (
          <tr>
            <td>
              <select onChange={event => changeNotificationDay(index, event.target.value)}>
                {DAY_NAMES.map(day => (
                  <option value={day} selected={day === dayName}>{day}</option>
                ))}
              </select>
            </td>
            <td>
              <input
                type="time"
                value={time}
                onChange={event => changeNotificationTime(index, event.target.value)}
              />
            </td>
            <td>
              <button
                type="button"
                title="Remove"
                onClick={() => setNotifications(notifications.filter((_, itemIndex) => itemIndex !== index))}
              >
                x
              </button>
            </td>
          </tr>
        ))}
        </tbody>
        <tr>
          <td colSpan={3}>
            <button type="button" onClick={() => setNotifications([
              ...notifications,
              {dayName: DAY_NAMES[0], time: '12:00'}
            ])}
            >
              Add
            </button>
          </td>
        </tr>
      </table>

      <p className={[styles.changesSaved, showChangesSaved && styles.shown].filter(Boolean).join(' ')}>
        Changes saved!
      </p>

      <p className={styles.submitWrapper}>
        <button
          type="button"
          onClick={async () => {
            resetForm();
            await resetOptions();
            showSaved();
          }}>
          Reset to defaults
        </button>
        <input type="submit" value="Save" className={styles.submit}/>
      </p>
    </form>
  )
};
