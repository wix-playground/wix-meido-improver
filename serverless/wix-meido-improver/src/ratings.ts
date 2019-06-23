import {RpcServiceContext} from "@wix/serverless-api";
import {Dictionary} from "./utils";

export type Ratings = Dictionary<number>;
export type AvgRatings = Dictionary<{ avg: number, count: number }>;
const DATASTORE_KEY = 'ratings';

export async function getUserRatings(ctx: RpcServiceContext, userId: string): Promise<Ratings> {
  const ratings = await ctx.datastore.get(DATASTORE_KEY) || {};
  return ratings[userId] || {}
}

export async function getAvgRatings(ctx: RpcServiceContext): Promise<AvgRatings> {
  const ratings: Dictionary<Ratings> = await ctx.datastore.get(DATASTORE_KEY) || {};
  const flatRatings: Array<[string, number]> = [].concat(...Object.values(ratings).map(ratings => Object.entries(ratings)));
  const allRatings: Dictionary<Array<number>> = flatRatings.reduce(
    (avg, [dishId, rating]) => ({
      ...avg,
      [dishId]: [...(avg[dishId] || []), rating]
    }),
    {}
  );

    return Object.assign(
    {},
    ...Object.entries(allRatings)
      .map(([dishId, ratingsList]) => ({
        [dishId]: {
          avg: avg(ratingsList),
          count: ratingsList.length,
        }
      }))
  )
}

function avg(arr: number[]): number {
  if (arr.length === 0) {
    return 0;
  }
  return arr.reduce((sum, item) => sum + item) / arr.length;
}

export async function setRating(ctx: RpcServiceContext, userId: string, dishId: string, rating: number): Promise<void> {
  const ratings = await ctx.datastore.get(DATASTORE_KEY) || {};
  const userRatings = ratings[userId] || {};

  await ctx.datastore.put(
    DATASTORE_KEY,
    {
      ...ratings,
      [userId]: {...userRatings, [dishId]: rating}
    }
  );
}