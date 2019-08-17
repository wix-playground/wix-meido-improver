import browser from 'webextension-polyfill';
import { IAvgRatings, DishId, IFavorites, IUserRatings } from './database';

const STORAGE_KEY = '__ITDXER_storage';

export interface IDishOrder {
  dishName: string;
  dishId: DishId;
  orderId: string;
  date: string;
  contractorName: string;
}

interface IOrderedDishes {
  list: IDishOrder[];
  updatedDate: string;
}

export interface IUserData {
  filterRating: boolean;
  filterOrdered: boolean;
  filterFavorite: boolean;
  filterVegan: boolean;
  filterText: string;
  userRatings: IUserRatings;
  avgRatings: IAvgRatings;
  favorites: IFavorites;
  orderedDishes: IOrderedDishes | null;
  orderedDishesInvalidated: boolean;
}

export async function getData(): Promise<IUserData> {
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

function fillDefaults(data: Partial<IUserData>): IUserData {
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

export async function saveData(data: Partial<IUserData>): Promise<void> {
  await browser.storage.local.set({ userData: data });
}

export async function updateData(fn: (userData: IUserData) => Partial<IUserData>): Promise<void> {
  const prevData = await getData();
  await saveData({ ...prevData, ...fn(prevData) });
}

export function subscribeForStorageChanges(handler: (newData: IUserData, oldValue: Partial<IUserData>) => void): void {
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
