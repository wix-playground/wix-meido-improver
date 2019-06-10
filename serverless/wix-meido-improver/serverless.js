module.exports = functionsBuilder =>
  functionsBuilder
    .withContextPath('wix-meido-improver')
    .addWebFunction('GET', '/get', async (ctx, req) => {
      return {hello: 'world'};
    });