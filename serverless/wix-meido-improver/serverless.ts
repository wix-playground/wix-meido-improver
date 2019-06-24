import {FunctionsBuilder} from '@wix/serverless-api';
import {Favorites, getFavorites, setFavorite, setFavorites} from "./src/favorites";
import {tryAuthAndGetUserId} from "./src/auth";
import {
  AvgRatings,
  Ratings,
  BothRatings,
  getBothRatings,
  getAvgRatings,
  getUserRatings,
  setRating,
  deleteRating
} from "./src/ratings";


module.exports = (functionsBuilder: FunctionsBuilder) =>
  functionsBuilder
    .withContextPath('wix-meido-improver')


    .addWebFunction('GET', '/favorites', async (ctx, req): Promise<Favorites> => {
      const userId = await tryAuthAndGetUserId(req);
      return getFavorites(ctx, userId);
    })
    .addWebFunction('POST', '/favorites', async (ctx, req): Promise<Favorites> => {
      const userId = await tryAuthAndGetUserId(req);
      await setFavorites(ctx, userId, req.body.favorites);
      return await getFavorites(ctx, userId);
    })
    .addWebFunction('POST', '/favorites/:dishId', async (ctx, req): Promise<Favorites> => {
      const userId = await tryAuthAndGetUserId(req);
      await setFavorite(ctx, userId, req.params.dishId, req.body.favorite);
      return await getFavorites(ctx, userId);
    })


    .addWebFunction('GET', '/both-ratings', async (ctx, req): Promise<BothRatings> => {
      const userId = await tryAuthAndGetUserId(req);
      return await getBothRatings(ctx, userId);
    })
    .addWebFunction('GET', '/ratings', async (ctx, req): Promise<Ratings> => {
      const userId = await tryAuthAndGetUserId(req);
      return await getUserRatings(ctx, userId);
    })
    .addWebFunction('GET', '/avg-ratings', async (ctx, req): Promise<AvgRatings> => {
      await tryAuthAndGetUserId(req);
      return await getAvgRatings(ctx);
    })
    .addWebFunction('POST', '/ratings/:dishId', async (ctx, req): Promise<BothRatings> => {
      const userId = await tryAuthAndGetUserId(req);
      await setRating(ctx, userId, req.params.dishId, req.body.rating);
      return await getBothRatings(ctx, userId);
    })
    .addWebFunction('DELETE', '/ratings/:dishId', async (ctx, req): Promise<BothRatings> => {
      const userId = await tryAuthAndGetUserId(req);
      await deleteRating(ctx, userId, req.params.dishId);
      return await getBothRatings(ctx, userId);
    });
