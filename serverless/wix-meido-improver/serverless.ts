import {FunctionsBuilder} from '@wix/serverless-api';
import {getFavorites, setFavorites} from "./src/favorites";
import {tryAuthAndGetUserId} from "./src/auth";

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
    });
