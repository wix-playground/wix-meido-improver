const https = require('https');

module.exports = functionsBuilder =>
  functionsBuilder
    .withContextPath('wix-meido-improver')
    .addWebFunction('GET', '/favorites', async (ctx, req) => {
      const userId = await tryAuthAndGetUserId(req);
      const favorites = await ctx.datastore.get('favorites');
      return favorites[userId] || {};
    })
    .addWebFunction('POST', '/favorites', async (ctx, req) => {
      const userId = await tryAuthAndGetUserId(req);
      const favorites = await ctx.datastore.get('favorites');
      await ctx.datastore.set('favorites', {...favorites, [userId]: req.body.favorites});
    });


async function tryAuthAndGetUserId(req) {
  const authCookie = getAuthCookie(req);
  const userId = getUserIdFromAuthCookie(authCookie);
  const headers = {
    'Cookie': authCookie,
  };

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
            reject(new Error('UserIdFromAuthCookie !== UserIdFromHtmlPage'))
          }
        });
      }).on("error", reject)
  );
}

function getAuthCookie(req) {
  const {authCookie} = req.method === 'GET' ? req.query : req.body;
  return authCookie;
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