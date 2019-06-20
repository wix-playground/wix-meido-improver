"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function getFavorites(ctx, userId) {
    const favorites = await ctx.datastore.get('favorites') || {};
    return favorites[userId] || {};
}
exports.getFavorites = getFavorites;
async function setFavorites(ctx, userId, favorites) {
    const otherFavorites = await ctx.datastore.get('favorites') || {};
    await ctx.datastore.put('favorites', Object.assign({}, otherFavorites, { [userId]: favorites }));
}
exports.setFavorites = setFavorites;
