const favorites_1 = require("./src/favorites");
const auth_1 = require("./src/auth");
exports.default = (functionsBuilder) => functionsBuilder
    .withContextPath('wix-meido-improver')
    .addWebFunction('GET', '/favorites', async (ctx, req) => {
    const userId = await auth_1.tryAuthAndGetUserId(req);
    return favorites_1.getFavorites(ctx, userId);
})
    .addWebFunction('POST', '/favorites', async (ctx, req) => {
    const userId = await auth_1.tryAuthAndGetUserId(req);
    await favorites_1.setFavorites(ctx, userId, req.body.favorites);
});
