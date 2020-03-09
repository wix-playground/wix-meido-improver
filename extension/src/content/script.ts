import {
  getData,
  subscribeForLoadingChanges,
  subscribeForStorageChanges,
  updateData,
  IUserData,
} from '../modules/localStorage';
import { DISH_COUNT_CLASS, invalidateOrderedDishesCache, renderOrderedDishes } from '../modules/orders';
import { addCategoryAll } from '../modules/categoryAll';
import { inIframe } from './rpcListener';
import { highlight, unHighlight } from '../modules/highlight';
import { IAvgRating, deleteRating, DishId, Rating, setRating, toggleFavorite } from '../modules/database';
import { waitForEmptySelector, waitForSelector } from '../modules/waitForSelector';
import { browser } from 'webextension-polyfill-ts';

import './fixes.css';
import './styles/categoryAll.css';
import './styles/filters.css';
import './styles/oneClickBuy.css';
import './styles/orderButton.css';
import './styles/rating.css';
import './styles/spinner.css';
import './styles/popupIframe.css';

const HEART_CLASS = '__ITDXER_heart';
const RATING_CLASS = '__ITDXER_rating';
const FILTERS_CLASS = '__ITDXER_filters';
const ORDER_BUTTON_CLASS = '__ITDXER_order_button';
const ONE_CLICK_BUY_CLASS = '__ITDXER_oneClickBuy';
const CHECKBOX_ICON_ORDERED = '__ITDXER_checkbox_icon_ordered';
const CHECKBOX_LABEL_ORDERED = '__ITDXER_checkbox_label_ordered';
const CHECKBOX_LABEL_FAVORITE = '__ITDXER_checkbox_label_favorite';
const CHECKBOX_LABEL_RATING = '__ITDXER_checkbox_label_rating';
const CHECKBOX_LABEL_VEGAN = '__ITDXER_checkbox_label_vegan';
const SEARCH_INPUT_CLASS = '__ITDXER_search_input';
const PARTIALLY_MATCHED_CLASS = '__ITDXER_first_partially_matched';
const SPINNER_CLASS = '__ITDXER_spinner';

window.addEventListener('DOMContentLoaded', () => {
  if (window.location.href.startsWith('https://wix.getmeido.com/order')) {
    addPopupIframe();
    addCategoryAll();
    openFirstCategory();
    addOneClickBuy();

    subscribeForStorageChanges(render);
    void renderOrderedDishes().then(() => renderWithData());
    void renderWithData();
    renderOrderTable();
    addRemoveCartButtonListener();
  }

  subscribeForLoadingChanges(loading => renderSpinner(document.body, loading));
});

function addPopupIframe() {
  const iframe = document.createElement('iframe');
  iframe.className = 'popup-iframe';
  iframe.src = browser.extension.getURL('popup.html');
  document.body.appendChild(iframe);
}

async function renderWithData(): Promise<void> {
  const data = await getData();
  render(data);
}

function openFirstCategory(): void {
  const firstCategoryTabSelected = !!document.querySelector('.suppliers .container .nav.nav-tabs.new-tabs li.active');
  const firstCategoryTab = <HTMLAnchorElement>(
    document.querySelector('.suppliers .container .nav.nav-tabs.new-tabs li:first-child a')
  );

  if ((!firstCategoryTabSelected || document.cookie.includes('activeTab=category_all')) && firstCategoryTab) {
    firstCategoryTab.click();
  }
}

function render(data: IUserData): void {
  const {
    filterRating,
    filterOrdered,
    filterFavorite,
    filterVegan,
    filterText,
    userRatings,
    avgRatings,
    favorites,
  } = data;

  const filters = (filterText || '')
    .toLowerCase()
    .split(',')
    .map(part =>
      part
        .split(' ')
        .map(p => p.trim())
        .filter(Boolean)
    )
    .filter(part => part.length !== 0);

  const panes = document.querySelectorAll('.suppliers-content .container > .tab-content > .tab-pane');
  [...panes].forEach(pane => {
    let firstPartiallyMatchedFound = false;

    [...pane.children]
      .map((item: HTMLElement) => {
        const content = <HTMLElement>item.querySelector('.menu-item__content');
        const button = <HTMLAnchorElement>content.querySelector('a.btn.buy');
        const dishId = button.href.split('/').pop() || '';
        const orderedElem = <HTMLElement>content.querySelector('.' + DISH_COUNT_CLASS);
        const orderedTimes = orderedElem ? parseInt(orderedElem.innerText) : 0;

        return {
          item,
          content,
          dishId,
          rating: (avgRatings[dishId] || { avg: 0 }).avg,
          includesFilters: includes(content, filters),
          isFavorite: !!favorites[dishId],
          isVegan: !!content.querySelector('img[src="/images/vegan.png"]'),
          orderedTimes,
        };
      })
      .map(({ includesFilters, dishId, isFavorite, isVegan, orderedTimes, rating, content, item }) => ({
        orderArr: [
          filterRating ? rating : -1,
          filters.length > 0 ? includesFilters : -1,
          filterFavorite ? (isFavorite ? 1 : 0) : -1,
          filterVegan ? (isVegan ? 1 : 0) : -1,
          filterOrdered ? orderedTimes : -1,
        ],
        includesFilters,
        item,
        content,
        dishId,
        isFavorite,
      }))
      .sort((a, b) => sortCompareArrays(a.orderArr, b.orderArr))
      .forEach(({ orderArr, item, content, dishId, isFavorite, includesFilters }, order) => {
        if (orderArr.some(a => a === 0) && !firstPartiallyMatchedFound) {
          item.classList.add(PARTIALLY_MATCHED_CLASS);
          firstPartiallyMatchedFound = true;
        } else {
          item.classList.remove(PARTIALLY_MATCHED_CLASS);
        }
        item.style.order = String(order + 1);

        setTimeout(() => renderHighlights(content, (<string[]>[]).concat(...filters), includesFilters > 0), 0);

        renderHeart(content, dishId, isFavorite);
        renderRating(content, dishId, userRatings[dishId], avgRatings[dishId]);
      });
  });

  const suppliersContent = <HTMLElement>document.querySelector('.suppliers > .suppliers-content');
  if (suppliersContent) {
    renderFilters({ suppliersContent, filterRating, filterOrdered, filterFavorite, filterVegan, filterText });
  }
}

function renderSpinner(place: HTMLElement, loading: boolean) {
  let spinner = place.querySelector('.' + SPINNER_CLASS);

  if (!spinner) {
    spinner = document.createElement('div');
    spinner.className = SPINNER_CLASS;
    place.appendChild(spinner);
  }

  spinner.classList.toggle('spinning', loading);
}

function renderHeart(content: HTMLElement, dishId: DishId, isFavorite: boolean) {
  let heart = content.querySelector('.' + HEART_CLASS);

  if (!heart) {
    heart = document.createElement('div');
    heart.className = HEART_CLASS;

    const button = document.createElement('button');
    button.innerText = '❤️';

    heart.appendChild(button);
    content.appendChild(heart);
  }

  const button = heart.querySelector('button');
  if (!button) {
    return;
  }
  button.onclick = () => toggleFavorite(dishId, !isFavorite);
  button.classList.toggle('checked', isFavorite);
}

function renderRating(content: HTMLElement, dishId: DishId, userRating: Rating, avgRating: IAvgRating) {
  let ratingElem = <HTMLElement>content.querySelector('.' + RATING_CLASS);

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
    shadow.innerText = '☆☆☆☆☆';
    shadow.style.width = '0%';

    const avgRatingElem = document.createElement('div');
    avgRatingElem.className = 'avg-rating';
    avgRatingElem.innerText = '★★★★★';
    avgRatingElem.style.width = '0%';

    const userRatingElem = document.createElement('div');
    userRatingElem.className = 'user-rating';
    userRatingElem.style.width = '0%';

    ratingElem.appendChild(deleteElem);
    ratingElem.appendChild(avgRatingElem);

    new Array(5)
      .fill(null)
      .map((_, index) => index + 1)
      .forEach(rating => {
        const star = createStar();
        star.onclick = () => setRating(dishId, rating);
        userRatingElem.appendChild(star);
      });

    ratingElem.appendChild(userRatingElem);
    ratingElem.appendChild(shadow);
    content.appendChild(ratingElem);
  }

  ratingElem.classList.toggle('user-rated', !!userRating);

  if (avgRating) {
    const rounded = (avgRating.avg || 0).toFixed(1);
    ratingElem.title = `${rounded} / 5  (${avgRating.count} Ratings)`;
  } else {
    ratingElem.title = '0 Ratings';
  }

  const avgRatingElem = <HTMLElement>ratingElem.querySelector('.avg-rating');
  const userRatingElem = <HTMLElement>ratingElem.querySelector('.user-rating');
  const avg = (avgRating && avgRating.avg) || 0;
  const user = userRating || 0;

  avgRatingElem.style.width = `${(avg / 5) * 100}%`;
  userRatingElem.style.width = `${(user / 5) * 100}%`;
  content.dataset.avgRating = String(avg);
}

function createStar(): HTMLSpanElement {
  const star = document.createElement('span');
  star.innerText = '☆';
  star.className = 'star';
  return star;
}

function addOneClickBuy(): void {
  const infos = document.querySelectorAll(
    '.suppliers-content .container .menu-item > .menu-item__content > .menu-item__info'
  );
  [...infos].forEach(itemInfo => {
    const buy = <HTMLAnchorElement>itemInfo.querySelector('.menu-item__info a.buy');
    const oneClick = createOneClickBuyElement(buy);
    itemInfo.appendChild(oneClick);
  });
}

function createOneClickBuyElement(buyButton: HTMLAnchorElement): HTMLAnchorElement {
  const oneClick = document.createElement('a');
  const dishId = buyButton.href.split('/').pop();

  oneClick.innerText = 'One Click Buy';
  oneClick.className = [ONE_CLICK_BUY_CLASS, 'btn btn-success'].join(' ');
  oneClick.dataset.dishId = dishId;

  oneClick.onclick = event => {
    event.preventDefault();
    Promise.resolve()
      .then(() => removeAllCartItems())
      .then(() => buyButton.click())
      .then(() => waitForSelector('#cart .cart__button > a'))
      .then(() => (<HTMLAnchorElement>document.querySelector('#cart .cart__button > a')).click());
  };

  return oneClick;
}

function renderFilters(params: {
  suppliersContent: HTMLElement;
  filterRating: boolean;
  filterFavorite: boolean;
  filterVegan: boolean;
  filterOrdered: boolean;
  filterText: string;
}) {
  const { suppliersContent, filterRating, filterFavorite, filterVegan, filterOrdered, filterText } = params;

  let filters: HTMLElement | null = suppliersContent.querySelector('.' + FILTERS_CLASS);
  if (!filters) {
    filters = createFiltersElement();
    suppliersContent.prepend(filters);
  }

  renderRatingCheckbox(filters, filterRating);
  renderFavoriteCheckbox(filters, filterFavorite);
  renderVeganCheckbox(filters, filterVegan);
  renderOrderedCheckbox(filters, filterOrdered);

  renderSearchInput(filters, filterText);
}

function createFiltersElement(): HTMLDivElement {
  const filters = document.createElement('div');
  filters.className = FILTERS_CLASS;
  return filters;
}

function renderRatingCheckbox(filters: HTMLElement, filterRating: boolean): void {
  let checkboxLabel = filters.querySelector('.' + CHECKBOX_LABEL_RATING);

  if (!checkboxLabel) {
    checkboxLabel = createCheckboxInLabel(
      '&nbsp;<span style="color: #ffd900;">★️</span> rating',
      CHECKBOX_LABEL_RATING,
      (event: Event) =>
        updateData(() => ({ filterRating: event.target ? (<HTMLInputElement>event.target).checked : false }))
    );

    filters.append(checkboxLabel);
  }

  const input = checkboxLabel.querySelector('input');
  if (!input) {
    return;
  }
  input.checked = filterRating;
}

function renderFavoriteCheckbox(filters: HTMLElement, filterFavorite: boolean): void {
  let checkboxLabel = filters.querySelector('.' + CHECKBOX_LABEL_FAVORITE);

  if (!checkboxLabel) {
    checkboxLabel = createCheckboxInLabel('&nbsp;<span>❤️</span> favorite', CHECKBOX_LABEL_FAVORITE, (event: Event) =>
      updateData(() => ({ filterFavorite: event.target ? (<HTMLInputElement>event.target).checked : false }))
    );

    filters.append(checkboxLabel);
  }

  const input = checkboxLabel.querySelector('input');
  if (!input) {
    return;
  }
  input.checked = filterFavorite;
}

function renderVeganCheckbox(filters: HTMLElement, filterVegan: boolean): void {
  let checkboxLabel = filters.querySelector('.' + CHECKBOX_LABEL_VEGAN);

  if (!checkboxLabel) {
    checkboxLabel = createCheckboxInLabel(
      '&nbsp;<img alt="vegan" src="/images/vegan.png" style="height: 1em"/> vegetarian',
      CHECKBOX_LABEL_VEGAN,
      (event: Event) =>
        updateData(() => ({ filterVegan: event.target ? (<HTMLInputElement>event.target).checked : false }))
    );

    filters.append(checkboxLabel);
  }

  const input = checkboxLabel.querySelector('input');
  if (!input) {
    return;
  }
  input.checked = filterVegan;
}

function renderOrderedCheckbox(filters: HTMLElement, filterOrdered: boolean): void {
  let checkboxLabel = filters.querySelector('.' + CHECKBOX_LABEL_ORDERED);

  if (!checkboxLabel) {
    checkboxLabel = createCheckboxInLabel(
      `&nbsp;<div class="${CHECKBOX_ICON_ORDERED}">n</div> ordered`,
      CHECKBOX_LABEL_ORDERED,
      (event: Event) =>
        updateData(() => ({ filterOrdered: event.target ? (<HTMLInputElement>event.target).checked : false }))
    );

    filters.append(checkboxLabel);
  }

  const input = checkboxLabel.querySelector('input');
  if (!input) {
    return;
  }
  input.checked = filterOrdered;
}

function renderSearchInput(filters: HTMLElement, filterText: string): void {
  let searchInput = <HTMLInputElement>filters.querySelector('.' + SEARCH_INPUT_CLASS);

  if (!searchInput) {
    searchInput = createSearchInput();
    filters.prepend(searchInput);
  }

  searchInput.value = filterText || '';
}

function createSearchInput(): HTMLInputElement {
  const searchInput = document.createElement('input');

  searchInput.className = SEARCH_INPUT_CLASS;
  searchInput.placeholder = 'Search... Example: Кур овоч, суп горох';
  searchInput.autofocus = !inIframe();
  searchInput.onkeyup = event => updateData(() => ({ filterText: (<HTMLInputElement>event.target).value }));

  return searchInput;
}

async function renderOrderTable(): Promise<void> {
  if (window.location.pathname.endsWith('/fast')) {
    const submitButton = await waitForSelector('.modal-open .modal-footer button.submit');

    submitButton.style.display = 'none';

    [...document.querySelectorAll('#calendar.table.calendar tbody td')]
      .map(td => ({ td, label: <HTMLLabelElement>td.querySelector('.btn.available-date') }))
      .filter(({ label }) => label)
      .forEach(({ td, label }) => {
        const orderButton = document.createElement('a');
        label.style.display = 'inline';

        orderButton.innerText = 'Order';
        orderButton.className = ORDER_BUTTON_CLASS;

        orderButton.onclick = () => {
          if (!inIframe()) {
            void invalidateOrderedDishesCache();
          }
          label.click();
          submitButton.click();
        };
        td.appendChild(orderButton);
      });
  }
}

function addRemoveCartButtonListener() {
  [...document.querySelectorAll('.cart__delete.delete-cart-product')].map(button =>
    button.addEventListener('click', () => invalidateOrderedDishesCache())
  );
}

function createCheckboxInLabel(labelHTML: string, className: string, onChange: (event: Event) => void) {
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.onchange = onChange;
  label.innerHTML = labelHTML;
  label.className = className;
  label.prepend(checkbox);
  return label;
}

function removeAllCartItems(): Promise<void> {
  const items = [...document.querySelectorAll('#cart .cart__delete')];
  return items.length === 0
    ? Promise.resolve()
    : Promise.resolve()
        .then(() => items.forEach((item: HTMLElement) => item.click()))
        .then(() => waitForEmptySelector('#cart .cart__delete'))
        .then(() => void 0);
}

function includes(whereElement: HTMLElement, filters: string[][]) {
  const where = whereElement.innerText.toLowerCase();

  return filters
    .map(parts => parts.filter(filter => where.includes(filter)).length)
    .filter(Boolean)
    .reduce((sum, len) => sum + len, 0);
}

const renderHighlights = (elem: HTMLElement, keywords: string[], shouldHighlight: boolean) => {
  unHighlight(elem);
  if (shouldHighlight && keywords.length !== 0) {
    highlight(elem, keywords);
  }
};

function sortCompareArrays(arr1: number[], arr2: number[]) {
  const longest = Math.max(arr1.length, arr2.length);
  const union = new Array(longest).fill(0).map((_, index) => [arr1[index] || 0, arr2[index] || 0]);

  return union.reduce((comp, [first, second]) => comp || second - first, 0);
}
