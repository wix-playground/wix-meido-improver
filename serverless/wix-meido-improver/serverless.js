"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const favorites_1 = require("./src/favorites");
const auth_1 = require("./src/auth");
const ratings_1 = require("./src/ratings");
module.exports = (functionsBuilder) => functionsBuilder
    .withContextPath('wix-meido-improver')
    .addWebFunction('GET', '/favorites', async (ctx, req) => {
    const userId = await auth_1.tryAuthAndGetUserId(req);
    return favorites_1.getFavorites(ctx, userId);
})
    .addWebFunction('POST', '/favorites', async (ctx, req) => {
    const userId = await auth_1.tryAuthAndGetUserId(req);
    await favorites_1.setFavorites(ctx, userId, req.body.favorites);
})
    .addWebFunction('POST', '/favorites/:dishId', async (ctx, req) => {
    const userId = await auth_1.tryAuthAndGetUserId(req);
    await favorites_1.setFavorite(ctx, userId, req.params.dishId, req.body.favorite);
})
    .addWebFunction('GET', '/ratings', async (ctx, req) => {
    const userId = await auth_1.tryAuthAndGetUserId(req);
    return await ratings_1.getUserRatings(ctx, userId);
})
    .addWebFunction('POST', '/ratings/:dishId', async (ctx, req) => {
    const userId = await auth_1.tryAuthAndGetUserId(req);
    await ratings_1.setRating(ctx, userId, req.params.dishId, req.body.rating);
})
    .addWebFunction('GET', '/avg-ratings', async (ctx, req) => {
    await auth_1.tryAuthAndGetUserId(req);
    return await ratings_1.getAvgRatings(ctx);
});
