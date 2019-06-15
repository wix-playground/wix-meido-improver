const https = require('https');
const {HttpError} = require('@wix/serverless-api');

module.exports = functionsBuilder =>
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


async function getFavorites(ctx, userId) {
  const favorites = await ctx.datastore.get('favorites') || {};
  return favorites[userId] || {}
}

async function setFavorites(ctx, userId, favorites) {
  const otherFavorites = await ctx.datastore.get('favorites') || {};
  await ctx.datastore.put('favorites', {...otherFavorites, [userId]: favorites});
}

async function tryAuthAndGetUserId(req) {
  const authCookie = getAuthCookie(req);
  const userId = getUserIdFromAuthCookie(authCookie);
  const headers = {'Cookie': authCookie,};

  return new Promise(
    (resolve, reject) => https.get(
      'https://wix.getmeido.com/order',
      {headers},
      resp => {
        let data = '';

        resp.on('data', chunk => data += chunk);

        resp.on('end', () => {
          if (userId === getUserIdFromHtmlPage(data)) {
            resolve(userId);
          } else {
            reject(new HttpError({status: 403, message: 'UserIdFromAuthCookie !== UserIdFromHtmlPage'}))
          }
        });
      }).on("error", reject)
  );
}

function getAuthCookie(req) {
  const {authCookie} = req.method === 'GET' ? req.query : req.body;
  return authCookie || '';
}

function getUserIdFromAuthCookie(authCookie) {
  const decoded = decodeURIComponent(authCookie);
  const reg = /:{i:0;s:\d+:"(\d+)"/;
  const matches = decoded.match(reg) || [];
  return matches[1] || '';
}

function getUserIdFromHtmlPage(html) {
  const reg = /<input id="user-id" value="(\d+)"/;
  const matches = html.match(reg) || [];
  return matches[1] || '';
}