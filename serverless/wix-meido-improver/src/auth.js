"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const serverless_api_1 = require("@wix/serverless-api");
const DO_NOT_CHECK_AUTH = false; // set to TRUE to disable auth check
async function tryAuthAndGetUserId(req) {
    const authCookie = getAuthCookie(req);
    const userId = getUserIdFromAuthCookie(authCookie);
    const headers = { 'Cookie': authCookie };
    const data = await new Promise((resolve, reject) => https.get('https://wix.getmeido.com/change-password', { headers }, resp => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => resolve(data));
    })
        .on("error", reject));
    if (userId !== getUserIdFromHtmlPage(data)) {
        if (DO_NOT_CHECK_AUTH) {
            console.error('UserIdFromAuthCookie !== UserIdFromHtmlPage; [DO_NOT_CHECK_AUTH=TRUE]');
        }
        else {
            throw new serverless_api_1.HttpError({ status: 403, message: 'UserIdFromAuthCookie !== UserIdFromHtmlPage' });
        }
    }
    return userId;
}
exports.tryAuthAndGetUserId = tryAuthAndGetUserId;
function getAuthCookie(req) {
    const { authCookie } = req.method === 'GET' ? req.query : req.body;
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
