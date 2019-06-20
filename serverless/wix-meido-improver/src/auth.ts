import * as https from "https";
import {HttpError} from "@wix/serverless-api/src/http/WebResponse";
import {WebRequest} from "@wix/serverless-api/src/http/WebRequest";

export async function tryAuthAndGetUserId(req: WebRequest): Promise<string> {
  const authCookie = getAuthCookie(req);
  const userId = getUserIdFromAuthCookie(authCookie);
  const headers = {'Cookie': authCookie};

  const data = await new Promise<string>((resolve, reject) =>
    https.get('https://wix.getmeido.com/order', {headers}, resp => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => resolve(data));
    })
      .on("error", reject)
  );

  if (userId !== getUserIdFromHtmlPage(data)) {
    throw new HttpError({status: 403, message: 'UserIdFromAuthCookie !== UserIdFromHtmlPage'});
  }

  return userId;
}

function getAuthCookie(req: WebRequest): string {
  const {authCookie} = req.method === 'GET' ? req.query : req.body;
  return authCookie || '';
}

function getUserIdFromAuthCookie(authCookie: string): string {
  const decoded = decodeURIComponent(authCookie);
  const reg = /:{i:0;s:\d+:"(\d+)"/;
  const matches = decoded.match(reg) || [];
  return matches[1] || '';
}

function getUserIdFromHtmlPage(html: string): string {
  const reg = /<input id="user-id" value="(\d+)"/;
  const matches = html.match(reg) || [];
  return matches[1] || '';
}