import {FunctionContext} from "@wix/serverless-api";
import {Dictionary} from "./utils";

export type Favorites = Dictionary<boolean>;
const DATASTORE_KEY = 'favorites';

export async function getFavorites(ctx: FunctionContext, userId: string): Promise<Favorites> {
  const favorites = await ctx.datastore.get(DATASTORE_KEY) || {};
  return favorites[userId] || {}
}

export async function setFavorite(ctx: FunctionContext, userId: string, dishId: string, favorite: boolean): Promise<void> {
  const favorites = {
    ...await getFavorites(ctx, userId),
    [dishId]: favorite,
  };
  await setFavorites(ctx, userId, favorites);
}

export async function setFavorites(ctx: FunctionContext, userId: string, favorites: Favorites): Promise<void> {
  const otherFavorites = await ctx.datastore.get(DATASTORE_KEY) || {};
  await ctx.datastore.put(
    'favorites',
    {
      ...otherFavorites,
      [userId]: favorites
    }
  );
}
