const STORAGE_KEY = '__ITDXER_storage';
const STAR_CLASS = '__ITDXER_star';
const FILTERS_CLASS = '__ITDXER_filters';
const ORDER_BUTTON_CLASS = '__ITDXER_order_button';
const ONE_CLICK_BUY_CLASS = '__ITDXER_oneClickBuy';


function render() {
  const data = getData();
  const {filterFavorite, filterVegan} = data;
  const items = document.querySelectorAll('.menu-item');
  [...items].forEach(item => {
    const content = item.querySelector('.menu-item__content');
    const button = content.querySelector('a.btn.buy');
    const hrefParts = button.href.split('/');
    const pid = hrefParts[hrefParts.length - 1];
    const isFavorite = !!data[pid];
    const isVegan = !!content.querySelector('img[src="/images/vegan.png"]');
    renderStar(content, pid, isFavorite);
    renderOneClickBuy(content);

    item.style.display = (filterFavorite && !data[pid]) || (filterVegan && !isVegan)
      ? 'none'
      : 'block';
  });
  renderFilters(filterFavorite, filterVegan);
  renderOrderTable();
}

render();

function renderStar(content, pid, isFavorite) {
  const stars = getStarElement(content);
  stars.innerHTML = '';

  const button = document.createElement('button');
  button.innerText = isFavorite ? '★' : '☆';
  button.style = `background: transparent; border: 0 none; font-size: 2em; color: orange; opacity: ${isFavorite ? '1' : '0.3'}`;
  button.onclick = () => {
    updateData(data => ({[pid]: !data[pid]}));
    render();
  };
  stars.appendChild(button);
}

function renderOneClickBuy(content) {
  const oneClick = getOneClickBuyElement(content);
  const buy = content.querySelector('.menu-item__info a.buy');

  oneClick.onclick = (event) => {
    event.preventDefault();
    Promise.resolve()
      .then(showSpinner)
      .then(() => removeAllCartItems())
      .then(() => buy.click())
      .then(() => waitForSelector('#cart .cart__button > a'))
      .then(() => document.querySelector('#cart .cart__button > a').click())
      .catch(console.error)
      .then(hideSpinner)
  }
}

function renderFilters(filterFavorite, filterVegan) {
  const filters = getFiltersElement();
  filters.innerHTML = `<span style="padding: 0 20px;"></span>`;

  filters.prepend(getCheckbox(
    '&nbsp;<span style="color: orange">★</span> Show only favorite',
    filterFavorite,
    (event) => {
      updateData(() => ({filterFavorite: event.target.checked}));
      render();
    }
  ));
  filters.append(getCheckbox(
    '&nbsp;<img src="/images/vegan.png" style="height: 1em"/> Show only vegetarian',
    filterVegan,
    (event) => {
      updateData(() => ({filterVegan: event.target.checked}));
      render();
    }
  ));
}

function renderOrderTable() {
  console.log("window.location.href", window.location.href, typeof window.location.href)
  if (window.location.href.endsWith('/fast')) {
    console.log("1")
    waitForSelector('.modal-open .modal-footer button.submit')
      .then(submitButton => {
        console.log("submitButton", submitButton, typeof submitButton);
        submitButton.style.display = 'none';

        ([...document.querySelectorAll('#calendar.table.calendar tbody td')])
          .map(td => ({td, label: td.querySelector('.btn.available-date')}))
          .filter(({label}) => label)
          .forEach(({td, label}) => {
            const orderButton = document.createElement('a');
            label.style.display = 'inline';

            orderButton.innerText = 'Order';
            orderButton.className = ORDER_BUTTON_CLASS;

            orderButton.onclick = () => {
              label.click()
              submitButton.click()
            };
            td.appendChild(orderButton);
          });
      })
  }
}

function getCheckbox(labelHTML, checked, onChange) {
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.onchange = onChange;
  checkbox.checked = checked;

  label.innerHTML = labelHTML;
  label.prepend(checkbox);
  return label;
}

function getData() {
  let data = null;

  try {
    data = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    console.log(error);
  }

  return data || {};
}

function saveData(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.log(error);
  }
}

function updateData(fn) {
  const data = getData();
  return saveData({...data, ...fn(data)});
}

function getStarElement(content) {
  let stars = content.querySelector('.' + STAR_CLASS);
  if (!stars) {
    stars = document.createElement('div');
    stars.className = STAR_CLASS;
    stars.style = 'top: 20px;right:20px;position: absolute;';
    content.appendChild(stars);
  }
  return stars;
}

function getFiltersElement() {
  const suppliersContent = document.querySelector('.suppliers-content');
  let filters = suppliersContent.querySelector('.' + FILTERS_CLASS);
  if (!filters) {
    filters = document.createElement('div');
    filters.className = FILTERS_CLASS;
    filters.style = 'padding: 0 40px; text-align: center;';
    suppliersContent.prepend(filters);
  }
  return filters;
}

function getOneClickBuyElement(content) {
  const buy = content.querySelector('.menu-item__info a.buy');
  const itemInfo = content.querySelector('.menu-item__info');
  let oneClick = itemInfo.querySelector('.' + ONE_CLICK_BUY_CLASS);
  if (!oneClick) {
    oneClick = document.createElement('a');
    oneClick.innerText = 'One Click Buy';
    oneClick.className = [ONE_CLICK_BUY_CLASS, 'btn btn-success one-click-buy'].join(' ');
    oneClick.style = 'margin-left: 10px';
    oneClick.dataset.vendor = buy.dataset.vendor;
    oneClick.href = buy.href;
    itemInfo.appendChild(oneClick);
  }
  return oneClick;
}

function waitForSelector(selector) {
  console.log(new Date())
  return new Promise(resolve => {
    const el = document.querySelector(selector);
    if (el) {
      resolve(el);
    } else {
      setTimeout(() => resolve(waitForSelector(selector)), 100)
    }
  })
}

function waitForEmptySelector(selector) {
  return new Promise(resolve => {
    const el = document.querySelector(selector);
    if (el) {
      setTimeout(() => resolve(waitForEmptySelector(selector)), 100)
    } else {
      resolve(el);
    }
  })
}


function removeAllCartItems() {
  const items = [...document.querySelectorAll('#cart .cart__delete')];
  console.log("cart delete button", items);
  return items.length
    ? Promise.resolve()
      .then(() => items.forEach(item => item.click()))
      .then(() => waitForEmptySelector('#cart .cart__delete'))
    : Promise.resolve();

}

let spinnersCount = 0;

function showSpinner() {
  spinnersCount++;
  document.body.style.cursor = "wait";
}

function hideSpinner() {
  spinnersCount--;
  if (spinnersCount === 0) {
    document.body.style.cursor = "default";
  }
}