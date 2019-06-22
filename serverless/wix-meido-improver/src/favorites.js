"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DATASTORE_KEY = 'favorites';
async function getFavorites(ctx, userId) {
    const favorites = await ctx.datastore.get(DATASTORE_KEY) || {};
    return favorites[userId] || {};
}
exports.getFavorites = getFavorites;
async function setFavorites(ctx, userId, favorites) {
    const otherFavorites = await ctx.datastore.get(DATASTORE_KEY) || {};
    await ctx.datastore.put('favorites', {
        ...otherFavorites,
        [userId]: favorites
    });
}
exports.setFavorites = setFavorites;
