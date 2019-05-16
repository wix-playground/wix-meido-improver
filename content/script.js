const STORAGE_KEY = '__ITDXER_storage';
const STAR_CLASS = '__ITDXER_star';
const FILTERS_CLASS = '__ITDXER_filters';
const ORDER_BUTTON_CLASS = '__ITDXER_order_button';
const ONE_CLICK_BUY_CLASS = '__ITDXER_oneClickBuy';
const CHECKBOX_LABEL_FAVORITE = '__ITDXER_checkbox_label_favorite';
const CHECKBOX_LABEL_VEGAN = '__ITDXER_checkbox_label_vegan';
const SEARCH_INPUT_CLASS = '__ITDXER_search_input';


window.addEventListener('DOMContentLoaded', () => {
  render();
  openFirstDay();
});

function openFirstDay() {
  document.querySelector('.suppliers .container .nav.nav-tabs.new-tabs li:first-child a').click();
}

function render() {
  const data = getData();
  const {filterFavorite, filterVegan, filterText} = data;

  const items = document.querySelectorAll('.menu-item');
  [...items].forEach(item => {
    const content = item.querySelector('.menu-item__content');
    const button = content.querySelector('a.btn.buy');
    const hrefParts = button.href.split('/'); //.pop();
    const pid = hrefParts[hrefParts.length - 1];

    const isFavorite = !!data[pid];
    const isVegan = !!content.querySelector('img[src="/images/vegan.png"]');

    unhighlight(content);
    const display = (!filterText || searchAndHiglight(content, filterText))
      && (!filterFavorite || data[pid])
      && (!filterVegan || isVegan);

    item.style.display = display
      ? 'block'
      : 'none';

    renderStar(content, pid, isFavorite);
    renderOneClickBuy(content);
  });

  const suppliersContent = document.querySelector('.suppliers-content');
  renderFilters(suppliersContent, filterFavorite, filterVegan, filterText);
  renderOrderTable();
}

function renderStar(content, pid, isFavorite) {
  let star = content.querySelector('.' + STAR_CLASS);

  if (!star) {
    star = document.createElement('div');
    star.className = STAR_CLASS;

    const button = document.createElement('button');
    button.onclick = () => {
      updateData(data => ({[pid]: !data[pid]}));
      render();
    };

    star.appendChild(button);
    content.appendChild(star);
  }

  const button = star.querySelector('button');
  button.innerText = isFavorite ? '★' : '☆';
  button.style = `opacity: ${isFavorite ? '1' : '0.3'}`;
}

function renderOneClickBuy(content) {
  const itemInfo = content.querySelector('.menu-item__info');
  let oneClick = itemInfo.querySelector('.' + ONE_CLICK_BUY_CLASS);

  if (!oneClick) {
    const buy = itemInfo.querySelector('.menu-item__info a.buy');
    oneClick = createOneClickBuyElement(buy);
    itemInfo.appendChild(oneClick);
  }
}

function createOneClickBuyElement(buy) {
  const oneClick = document.createElement('a');

  oneClick.innerText = 'One Click Buy';
  oneClick.className = [ONE_CLICK_BUY_CLASS, 'btn btn-success'].join(' ');
  oneClick.href = buy.href;
  oneClick.dataset.vendor = buy.dataset.vendor;

  oneClick.onclick = (event) => {
    event.preventDefault();
    Promise.resolve()
      .then(() => removeAllCartItems())
      .then(() => buy.click())
      .then(() => waitForSelector('#cart .cart__button > a'))
      .then(() => document.querySelector('#cart .cart__button > a').click());
  };

  return oneClick;
}


function renderFilters(suppliersContent, filterFavorite, filterVegan, filterText) {
  let filters = suppliersContent.querySelector('.' + FILTERS_CLASS);
  if (!filters) {
    filters = createFiltersElement();
    suppliersContent.prepend(filters);
  }

  renderFavoriteCheckbox(filters, filterFavorite);
  renderVeganCheckbox(filters, filterVegan);
  renderSearchInput(filters, filterText)
}

function createFiltersElement() {
  const filters = document.createElement('div');
  filters.className = FILTERS_CLASS;
  filters.innerHTML = `<span style="padding: 0 20px;"></span>`;
  return filters;
}

function renderFavoriteCheckbox(filters, filterFavorite) {
  let checkboxLabel = filters.querySelector('.' + CHECKBOX_LABEL_FAVORITE);

  if (!checkboxLabel) {
    checkboxLabel = createCheckboxInLabel(
      '&nbsp;<span style="color: orange">★</span> Show only favorite',
      CHECKBOX_LABEL_FAVORITE,
      (event) => {
        updateData(() => ({filterFavorite: event.target.checked}));
        render();
      }
    );

    filters.prepend(checkboxLabel);
  }

  checkboxLabel.querySelector('input').checked = filterFavorite;
}

function renderVeganCheckbox(filters, filterVegan) {
  let checkboxLabel = filters.querySelector('.' + CHECKBOX_LABEL_VEGAN);

  if (!checkboxLabel) {
    checkboxLabel = createCheckboxInLabel(
      '&nbsp;<img alt="vegan" src="/images/vegan.png" style="height: 1em"/> Show only vegetarian',
      CHECKBOX_LABEL_VEGAN,
      (event) => {
        updateData(() => ({filterVegan: event.target.checked}));
        render();
      }
    );

    filters.append(checkboxLabel);
  }

  checkboxLabel.querySelector('input').checked = filterVegan;
}


function renderSearchInput(filters, filterText) {
  let searchInput = filters.querySelector('.' + SEARCH_INPUT_CLASS);

  if (!searchInput) {
    searchInput = createSearchInput();
    filters.prepend(searchInput);
  }

  searchInput.value = filterText || '';
}

function createSearchInput() {
  const searchInput = document.createElement('input');

  searchInput.className = SEARCH_INPUT_CLASS;
  searchInput.placeholder = 'Search... Example: Кур овоч, суп горох';
  searchInput.autofocus = true;
  searchInput.onkeyup = event => {
    updateData(() => ({filterText: event.target.value}));
    render();
  };

  return searchInput;
}


function renderOrderTable() {
  if (window.location.href.endsWith('/fast')) {
    waitForSelector('.modal-open .modal-footer button.submit')
      .then(submitButton => {
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
              label.click();
              submitButton.click();
            };
            td.appendChild(orderButton);
          });
      })
  }
}

function createCheckboxInLabel(labelHTML, className, onChange) {
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.onchange = onChange;
  label.innerHTML = labelHTML;
  label.className = className;
  label.prepend(checkbox);
  return label;
}

function waitForSelector(selector) {
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
  return items.length
    ? Promise.resolve()
      .then(() => items.forEach(item => item.click()))
      .then(() => waitForEmptySelector('#cart .cart__delete'))
    : Promise.resolve();

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


function searchAndHiglight(whereElement, filterText) {
  const filters = (filterText || '').toLowerCase().split(',')
    .map(part => part.split(' ').filter(Boolean))
    .filter(part => part.length !== 0);
  const where = whereElement.innerText.toLowerCase();

  return filters.some(
    parts => {
      const found = parts.every(filter => where.includes(filter));
      highlight(whereElement, parts);
      return found;
    }
  );
}
