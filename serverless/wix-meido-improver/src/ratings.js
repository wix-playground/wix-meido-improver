"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DATASTORE_KEY = 'ratings';
async function getUserRatings(ctx, userId) {
    const ratings = await ctx.datastore.get(DATASTORE_KEY) || {};
    return ratings[userId] || {};
}
exports.getUserRatings = getUserRatings;
async function getAvgRatings(ctx) {
    const ratings = await ctx.datastore.get(DATASTORE_KEY) || {};
    const flatRatings = [].concat(...Object.values(ratings).map(ratings => Object.entries(ratings)));
    const allRatings = flatRatings.reduce((avg, [dishId, rating]) => ({
        ...avg,
        [dishId]: [...(avg[dishId] || []), rating]
    }), {});
    return Object.assign({}, ...Object.entries(allRatings)
        .map(([dishId, ratingsList]) => ({
        [dishId]: {
            avg: avg(ratingsList),
            count: ratingsList.length,
        }
    })));
}
exports.getAvgRatings = getAvgRatings;
function avg(arr) {
    if (arr.length === 0) {
        return 0;
    }
    return arr.reduce((sum, item) => sum + item) / arr.length;
}
async function setRating(ctx, userId, dishId, rating) {
    const ratings = await ctx.datastore.get(DATASTORE_KEY) || {};
    const userRatings = ratings[userId] || {};
    await ctx.datastore.put(DATASTORE_KEY, {
        ...ratings,
        [userId]: { ...userRatings, [dishId]: rating }
    });
}
exports.setRating = setRating;
async function deleteRating(ctx, userId, dishId) {
    const ratings = await ctx.datastore.get(DATASTORE_KEY) || {};
    const userRatings = { ...(ratings[userId] || {}) };
    delete userRatings[dishId];
    await ctx.datastore.put(DATASTORE_KEY, { ...ratings, [userId]: userRatings });
}
exports.deleteRating = deleteRating;
