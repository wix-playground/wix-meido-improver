import {RpcServiceContext} from "@wix/serverless-api";
import {Dictionary} from "./utils";

export type Favorites = Dictionary<number>;
const DATASTORE_KEY = 'favorites';

export async function getFavorites(ctx: RpcServiceContext, userId: string): Promise<Favorites> {
  const favorites = await ctx.datastore.get(DATASTORE_KEY) || {};
  return favorites[userId] || {}
}

export async function setFavorites(ctx: RpcServiceContext, userId: string, favorites: Favorites): Promise<void> {
  const otherFavorites = await ctx.datastore.get(DATASTORE_KEY) || {};
  await ctx.datastore.put(
    'favorites',
    {
      ...otherFavorites,
      [userId]: favorites
    }
  );
}
