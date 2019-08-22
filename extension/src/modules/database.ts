import { browser } from 'webextension-polyfill-ts';
import { startLoading, stopLoading, updateData, getData, saveData } from './localStorage';

void fixFavoritesDataStructure();
void syncRatings();

export type DishId = string;
export type Rating = number;

export interface IAvgRating {
  count: number;
  avg: Rating;
}

export interface IFavorites {
  [dishId: string]: boolean;
}

export interface IUserRatings {
  [dishId: string]: Rating;
}

export interface IAvgRatings {
  [dishId: string]: IAvgRating;
}

export interface IBothRatings {
  userRatings: IUserRatings;
  avgRatings: IAvgRatings;
}

async function fixFavoritesDataStructure(): Promise<void> {
  const { ...data } = await getData();
  const favorites = {};

  Object.entries(data).forEach(([key, value]) => {
    if (parseInt(key).toString() === key) {
      favorites[key] = value;
      delete data[key];
    }
  });

  if (Object.keys(favorites).length > 0) {
    const newFavorites = { ...data.favorites, ...favorites };
    await saveData({ ...data, favorites: newFavorites });
    await saveFavorites(newFavorites);
  } else {
    await syncFavorites();
  }
}

async function syncFavorites(): Promise<void> {
  const favorites = await fetchFavorites();
  await updateData(() => ({ favorites }));
}

async function syncRatings(): Promise<void> {
  const { userRatings, avgRatings } = await fetchBothRatings();
  await updateData(() => ({ userRatings, avgRatings }));
}

function getAuthCookie(): string {
  const reg = /(^|; )([a-z0-9]{32}=[^;]*)/;
  return (document.cookie.match(reg) || '')[2];
}

async function fetchFavorites(): Promise<IFavorites> {
  return await doRequest('GET', '/favorites');
}

async function saveFavorites(favorites: IFavorites): Promise<void> {
  const updatedFavorites = await doRequest<IFavorites>('POST', '/favorites', { favorites });
  await updateData(() => ({ favorites: updatedFavorites }));
}

export async function setRating(dishId: DishId, rating: Rating): Promise<void> {
  await updateData(({ userRatings, avgRatings }) => {
    const avg = avgRatings[dishId] || { count: 0, avg: 0 };

    const newAvg = {
      count: avg.count + 1,
      avg: (avg.count * avg.avg + rating) / (avg.count + 1),
    };

    return {
      userRatings: { ...userRatings, [dishId]: rating },
      avgRatings: { ...avgRatings, [dishId]: newAvg },
    };
  });

  const { userRatings, avgRatings } = await doRequest('POST', `/ratings/${encodeURIComponent(dishId)}`, { rating });
  await updateData(() => ({ userRatings, avgRatings }));
}

export async function deleteRating(dishId: DishId): Promise<void> {
  await updateData(({ userRatings }) => {
    const newRatings = userRatings || {};
    delete newRatings[dishId];
    return { userRatings: newRatings };
  });

  const { userRatings, avgRatings } = await doRequest<IBothRatings>('DELETE', `/ratings/${encodeURIComponent(dishId)}`);
  await updateData(() => ({ userRatings, avgRatings }));
}

export async function toggleFavorite(dishId: DishId, favorite: boolean): Promise<void> {
  await updateData(({ favorites }) => ({ favorites: { ...favorites, [dishId]: favorite } }));

  const favorites = await doRequest<IFavorites>('POST', `/favorites/${encodeURIComponent(dishId)}`, { favorite });
  await updateData(() => ({ favorites }));
}

async function fetchBothRatings(): Promise<IBothRatings> {
  return await doRequest('GET', '/both-ratings');
}

async function doRequest<T>(method: 'GET' | 'POST' | 'DELETE', endpoint: string, params: object = {}) {
  const data = { ...params, authCookie: getAuthCookie() };

  startLoading();
  let response = null;
  try {
    response = await browser.runtime.sendMessage({
      contentScriptQuery: 'request',
      args: { method, endpoint, data },
    });
  } catch (error) {
    console.error(error);
  }
  stopLoading();

  const [error, result] = response || ['error', {}];

  if (error) {
    throw error;
  }

  return <T>result;
}
