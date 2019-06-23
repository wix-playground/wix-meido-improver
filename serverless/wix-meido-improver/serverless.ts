import {FunctionsBuilder} from '@wix/serverless-api';
import {getFavorites, setFavorite, setFavorites} from "./src/favorites";
import {tryAuthAndGetUserId} from "./src/auth";
import {deleteRating, getAvgRatings, getUserRatings, setRating} from "./src/ratings";


module.exports = (functionsBuilder: FunctionsBuilder) =>
  functionsBuilder
    .withContextPath('wix-meido-improver')


    .addWebFunction('GET', '/favorites', async (ctx, req) => {
      const userId = await tryAuthAndGetUserId(req);
      return getFavorites(ctx, userId);
    })
    .addWebFunction('POST', '/favorites', async (ctx, req) => {
      const userId = await tryAuthAndGetUserId(req);
      await setFavorites(ctx, userId, req.body.favorites);
    })
    .addWebFunction('POST', '/favorites/:dishId', async (ctx, req) => {
      const userId = await tryAuthAndGetUserId(req);
      await setFavorite(ctx, userId, req.params.dishId, req.body.favorite);
    })


    .addWebFunction('GET', '/ratings', async (ctx, req) => {
      const userId = await tryAuthAndGetUserId(req);
      return await getUserRatings(ctx, userId);
    })
    .addWebFunction('POST', '/ratings/:dishId', async (ctx, req) => {
      const userId = await tryAuthAndGetUserId(req);
      await setRating(ctx, userId, req.params.dishId, req.body.rating);
    })
    .addWebFunction('DELETE', '/ratings/:dishId', async (ctx, req) => {
      const userId = await tryAuthAndGetUserId(req);
      await deleteRating(ctx, userId, req.params.dishId);
    })
    .addWebFunction('GET', '/avg-ratings', async (ctx, req) => {
      await tryAuthAndGetUserId(req);
      return await getAvgRatings(ctx);
    });
