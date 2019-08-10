import { clearData } from '../modules/localStorage';
import { DAY_NAMES, setOptions, getOptions } from './storage';

import './styles.css';
import { resetOptions } from './storage';

function createInputsTr(
  selectedDayName: string,
  enteredTime: string,
  onRemoveClick: (event: Event) => void
): HTMLTableRowElement {
  const tr = document.createElement('tr');
  const tdDay = document.createElement('td');
  const tdTime = document.createElement('td');
  const tdRemove = document.createElement('td');

  const day = document.createElement('select');
  day.name = 'dayName[]';

  DAY_NAMES.forEach(dayName => {
    const option = document.createElement('option');
    option.innerText = dayName;
    option.value = dayName;
    option.selected = dayName === selectedDayName;
    day.appendChild(option);
  });

  const time = document.createElement('input');
  time.name = 'time[]';
  time.type = 'time';
  time.setAttribute('required', 'true');
  time.value = enteredTime;

  const remove = document.createElement('button');
  remove.innerText = 'Remove';
  remove.type = 'button';
  remove.addEventListener('click', onRemoveClick);

  tdDay.appendChild(day);
  tdTime.appendChild(time);
  tdRemove.appendChild(remove);
  tr.appendChild(tdDay);
  tr.appendChild(tdTime);
  tr.appendChild(tdRemove);

  return tr;
}

const form = document.forms[0];
const table = document.getElementsByTagName('table')[0];
const tableTbody = document.getElementsByTagName('tbody')[0];
const enableNotificationsInput = <HTMLInputElement>document.getElementsByName('enableNotifications')[0];
const changesSavedElem = document.getElementById('changes-saved');

enableNotificationsInput.addEventListener('change', event => {
  const checked = (<HTMLInputElement>event.currentTarget).checked;
  table.classList.toggle('notifications-enabled', checked);
});

function appendTrInputs(dayName, time) {
  const onRemoveClick = event => {
    event.preventDefault();
    const button = event.currentTarget;
    const tr = button.parentElement.parentElement;
    tr.parentElement.removeChild(tr);
  };
  const tr = createInputsTr(dayName, time, onRemoveClick);
  tableTbody.appendChild(tr);
}

const addButton = document.getElementById('add');
addButton.addEventListener('click', event => {
  event.preventDefault();
  appendTrInputs(DAY_NAMES[0], '12:00');
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const dayNames = [...document.getElementsByName('dayName[]')].map(input => (<HTMLInputElement>input).value);
  const times = [...document.getElementsByName('time[]')].map(input => (<HTMLInputElement>input).value);

  const options = {
    enableNotifications: enableNotificationsInput.checked,
    notifications: dayNames.map((dayName, index) => ({ dayName, time: times[index] })),
  };

  await setOptions(options);
  changesSavedElem.classList.add('shown');
  setTimeout(() => changesSavedElem.classList.remove('shown'), 1000);
});

document.getElementById('clear-cache').addEventListener('click', () => clearData());
document.getElementById('reset').addEventListener('click', async () => {
  await resetOptions();
  location.reload(true);
});

(async () => {
  const { enableNotifications, notifications } = await getOptions();

  enableNotificationsInput.checked = enableNotifications;
  enableNotificationsInput.dispatchEvent(new Event('change'));

  notifications.forEach(({ dayName, time }) => appendTrInputs(dayName, time));
})();
