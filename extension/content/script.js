const HEART_CLASS = '__ITDXER_heart';
const RATING_CLASS = '__ITDXER_rating';
const FILTERS_CLASS = '__ITDXER_filters';
const ORDER_BUTTON_CLASS = '__ITDXER_order_button';
const ONE_CLICK_BUY_CLASS = '__ITDXER_oneClickBuy';
const CHECKBOX_ICON_ORDERED = '__ITDXER_checkbox_icon_ordered';
const CHECKBOX_LABEL_ORDERED = '__ITDXER_checkbox_label_ordered';
const CHECKBOX_LABEL_FAVORITE = '__ITDXER_checkbox_label_favorite';
const CHECKBOX_LABEL_VEGAN = '__ITDXER_checkbox_label_vegan';
const SEARCH_INPUT_CLASS = '__ITDXER_search_input';
const PARTIALLY_MATCHED_CLASS = '__ITDXER_first_partially_matched';

window.addEventListener('DOMContentLoaded', () => {
  addCategoryAll();
  openFirstCategory();

  subscribeForStorageChanges(render);
  renderOrderedDishes(renderWithData);
  renderWithData();
  renderOrderTable();
});

function renderWithData() {
  const data = getData();
  render(data);
}

function openFirstCategory() {
  const firstCategoryTabSelected = !!document.querySelector('.suppliers .container .nav.nav-tabs.new-tabs li.active');
  const firstCategoryTab = document.querySelector('.suppliers .container .nav.nav-tabs.new-tabs li:first-child a');

  if ((!firstCategoryTabSelected || document.cookie.includes('activeTab=category_all')) && firstCategoryTab) {
    firstCategoryTab.click();
  }
}

function render(data) {
  const {filterOrdered, filterFavorite, filterVegan, filterText, userRatings = {}, avgRatings = {}} = data;

  const filters = (filterText || '')
    .toLowerCase()
    .split(',')
    .map(part => part.split(' ').map(p => p.trim()).filter(Boolean))
    .filter(part => part.length !== 0);

  const panes = document.querySelectorAll('.suppliers-content .container > .tab-content > .tab-pane');
  [...panes].forEach(pane => {
    let firstPartiallyMatchedFound = false;

    [...pane.children]
      .map(item => {
        const content = item.querySelector('.menu-item__content');
        const button = content.querySelector('a.btn.buy');
        const dishId = button.href.split('/').pop();
        const orderedElem = content.querySelector('.' + DISH_COUNT_CLASS);
        const orderedTimes = orderedElem ? parseInt(orderedElem.innerText) : 0;

        return ({
          item,
          content,
          dishId,
          includesFilters: includes(content, filters),
          isFavorite: isFavorite(dishId),
          isVegan: !!content.querySelector('img[src="/images/vegan.png"]'),
          orderedTimes,
        });
      })
      .map(({includesFilters, dishId, isFavorite, isVegan, orderedTimes, content, item}) => ({
        orderArr: [
          filters.length > 0 ? includesFilters : -1,
          filterFavorite ? isFavorite ? 1 : 0 : -1,
          filterVegan ? (isVegan ? 1 : 0) : -1,
          filterOrdered ? orderedTimes : -1
        ],
        includesFilters, item, content, dishId, isFavorite
      }))
      .sort((a, b) => sortCompareArrays(a.orderArr, b.orderArr))
      .forEach(({orderArr, item, content, dishId, isFavorite, includesFilters}, order) => {
        if (orderArr.some(a => a === 0) && !firstPartiallyMatchedFound) {
          item.classList.add(PARTIALLY_MATCHED_CLASS);
          firstPartiallyMatchedFound = true;
        } else {
          item.classList.remove(PARTIALLY_MATCHED_CLASS);
        }
        item.style.order = String(order + 1);

        setTimeout(() => renderHighlights(content, [].concat(...filters), includesFilters > 0), 0);

        renderHeart(content, dishId, isFavorite);
        renderRating(content, dishId, userRatings[dishId], avgRatings[dishId]);
        renderOneClickBuy(content);
      });
  });

  const suppliersContent = document.querySelector('.suppliers-content');
  if (suppliersContent) {
    renderFilters(suppliersContent, filterOrdered, filterFavorite, filterVegan, filterText);
  }
}

function renderHeart(content, dishId, isFavorite) {
  let heart = content.querySelector('.' + HEART_CLASS);

  if (!heart) {
    heart = document.createElement('div');
    heart.className = HEART_CLASS;

    const button = document.createElement('button');
    button.innerText = '❤️';
    button.onclick = () => toggleFavorite(dishId);

    heart.appendChild(button);
    content.appendChild(heart);
  }

  const button = heart.querySelector('button');
  button.style = `opacity: ${isFavorite ? '1' : '0.1'}`;
}

function renderRating(content, dishId, userRating, avgRating) {
  let ratingElem = content.querySelector('.' + RATING_CLASS);

  if (!ratingElem) {
    ratingElem = document.createElement('div');
    ratingElem.className = RATING_CLASS;

    const deleteElem = document.createElement('div');
    deleteElem.className = 'delete';
    deleteElem.innerText = '❌';
    deleteElem.title = 'Delete my rating';
    deleteElem.onclick = () => deleteRating(dishId);

    const shadow = document.createElement('div');
    shadow.className = 'shadow';
    shadow.innerText = '★★★★★';
    shadow.style.width = '0%';

    new Array(5)
      .fill(null)
      .map((_, index) => index + 1)
      .forEach(rating => {
        const star = createStar();
        star.onclick = () => setRating(dishId, rating);
        ratingElem.appendChild(star);
      });

    ratingElem.appendChild(deleteElem);
    ratingElem.appendChild(shadow);
    content.appendChild(ratingElem);
  }

  if (userRating) {
    ratingElem.classList.add('user-rated');
  } else {
    ratingElem.classList.remove('user-rated');
  }

  if (avgRating) {
    ratingElem.title = `${avgRating.avg} / 5  (${avgRating.count} Ratings)`;
  } else {
    ratingElem.title = '0 Ratings';
  }

  const shadow = ratingElem.querySelector('.shadow');
  const r = userRating || (avgRating && avgRating.avg) || 0;
  shadow.style.width = `${((5 - r) / 5) * 100}%`;
}

function createStar() {
  const star = document.createElement('span');
  star.innerText = '★';
  star.className = 'star';
  return star;
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


function renderFilters(suppliersContent, filterOrdered, filterFavorite, filterVegan, filterText) {
  let filters = suppliersContent.querySelector('.' + FILTERS_CLASS);
  if (!filters) {
    filters = createFiltersElement();
    suppliersContent.prepend(filters);
  }

  renderFavoriteCheckbox(filters, filterFavorite);
  renderVeganCheckbox(filters, filterVegan);
  renderOrderedCheckbox(filters, filterOrdered);

  renderSearchInput(filters, filterText)
}

function createFiltersElement() {
  const filters = document.createElement('div');
  filters.className = FILTERS_CLASS;
  return filters;
}

function renderFavoriteCheckbox(filters, filterFavorite) {
  let checkboxLabel = filters.querySelector('.' + CHECKBOX_LABEL_FAVORITE);

  if (!checkboxLabel) {
    checkboxLabel = createCheckboxInLabel(
      '&nbsp;<span>❤️</span> favorite',
      CHECKBOX_LABEL_FAVORITE,
      event => updateData(() => ({filterFavorite: event.target.checked}))
    );

    filters.append(checkboxLabel);
  }

  checkboxLabel.querySelector('input').checked = filterFavorite;
}

function renderVeganCheckbox(filters, filterVegan) {
  let checkboxLabel = filters.querySelector('.' + CHECKBOX_LABEL_VEGAN);

  if (!checkboxLabel) {
    checkboxLabel = createCheckboxInLabel(
      '&nbsp;<img alt="vegan" src="/images/vegan.png" style="height: 1em"/> vegetarian',
      CHECKBOX_LABEL_VEGAN,
      event => updateData(() => ({filterVegan: event.target.checked}))
    );

    filters.append(checkboxLabel);
  }

  checkboxLabel.querySelector('input').checked = filterVegan;
}

function renderOrderedCheckbox(filters, filterOrdered) {
  let checkboxLabel = filters.querySelector('.' + CHECKBOX_LABEL_ORDERED);

  if (!checkboxLabel) {
    checkboxLabel = createCheckboxInLabel(
      `&nbsp;<div class="${CHECKBOX_ICON_ORDERED}">n</div> ordered`,
      CHECKBOX_LABEL_ORDERED,
      event => updateData(() => ({filterOrdered: event.target.checked}))
    );

    filters.append(checkboxLabel);
  }

  checkboxLabel.querySelector('input').checked = filterOrdered;
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
  searchInput.onkeyup = event => updateData(() => ({filterText: event.target.value}));

  return searchInput;
}


function renderOrderTable() {
  if (window.location.pathname.endsWith('/fast')) {
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
              unvalidateOrderedDishesCache();
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


function removeAllCartItems() {
  const items = [...document.querySelectorAll('#cart .cart__delete')];
  return items.length
    ? Promise.resolve()
      .then(() => items.forEach(item => item.click()))
      .then(() => waitForEmptySelector('#cart .cart__delete'))
    : Promise.resolve();

}

function includes(whereElement, filters) {
  const where = whereElement.innerText.toLowerCase();

  return filters
    .map(parts => parts.filter(filter => where.includes(filter)).length)
    .filter(Boolean)
    .reduce((sum, len) => sum + len, 0);
}

const renderHighlights = ((elem, keywords, shouldHighlight) => {
  unhighlight(elem);
  if (shouldHighlight && keywords.length !== 0) {
    highlight(elem, keywords);
  }
});


function sortCompareArrays(arr1, arr2) {
  const longest = Math.max(arr1.length, arr2.length);
  const union = new Array(longest)
    .fill(0)
    .map((_, index) => [arr1[index] || 0, arr2[index] || 0]);

  return union.reduce((comp, [first, second]) => comp || (second - first), 0);
}