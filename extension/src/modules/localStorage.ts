import browser from 'webextension-polyfill';
import { AvgRatings, DishId, Favorites, UserRatings } from './database';

const STORAGE_KEY = '__ITDXER_storage';

export type DishOrder = {
  dishName: string;
  dishId: DishId;
  orderId: string;
  date: string;
  contractorName: string;
};
type OrderedDishes = {
  list: DishOrder[];
  updatedDate: string;
};

export type UserData = {
  filterRating: boolean;
  filterOrdered: boolean;
  filterFavorite: boolean;
  filterVegan: boolean;
  filterText: string;
  userRatings: UserRatings;
  avgRatings: AvgRatings;
  favorites: Favorites;
  orderedDishes: OrderedDishes | null;
  orderedDishesInvalidated: boolean;
};

export async function getData(): Promise<UserData> {
  let data = null;

  try {
    const localStorageData = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (localStorageData) {
      data = localStorageData;
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      const userDataItems = await browser.storage.local.get('userData');
      data = userDataItems.userData;
    }
  } catch (error) {
    console.log(error);
  }

  return fillDefaults(data);
}

function fillDefaults(data: Partial<UserData>): UserData {
  return {
    filterRating: false,
    filterOrdered: false,
    filterFavorite: false,
    filterVegan: false,
    filterText: '',
    userRatings: {},
    avgRatings: {},
    favorites: {},
    orderedDishes: null,
    orderedDishesInvalidated: false,
    ...data,
  };
}

export async function clearData(): Promise<void> {
  await browser.storage.local.remove('userData');
}

export async function saveData(data: Partial<UserData>): Promise<void> {
  await browser.storage.local.set({ userData: data });
}

export async function updateData(fn: (userData: UserData) => Partial<UserData>): Promise<void> {
  const prevData = await getData();
  await saveData({ ...prevData, ...fn(prevData) });
}

export function subscribeForStorageChanges(handler: (newData: UserData, oldValue: Partial<UserData>) => void): void {
  browser.storage.onChanged.addListener(async changes => {
    if (changes.userData) {
      const { newValue, oldValue } = changes.userData;
      handler(fillDefaults(newValue), oldValue);
    }
  });
}

let loading = 0;
const loadingListeners = [];

export function subscribeForLoadingChanges(fn: (loading: boolean) => void): void {
  loadingListeners.push(fn);
}

export function startLoading(): void {
  loading++;
  loadingListeners.forEach(fn => fn(loading));
}

export function stopLoading(): void {
  loading--;
  loadingListeners.forEach(fn => fn(loading));
}
