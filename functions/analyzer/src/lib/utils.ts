export const requestFromContext = (context: any) => {
  const headers = new Headers();
  for (const header of Object.keys(context.req.headers)) {
    headers.set(header, context.req.headers[header]);
  }

  let body = context.req.bodyRaw;
  if (context.req.method === 'GET' || context.req.method === 'HEAD') {
    body = undefined;
  }

  const request = new Request(context.req.url, {
    method: context.req.method,
    body,
    headers,
  });

  return request;
};

export async function responseForContext(context: any, response: any) {
  const headers: Record<string, string> = {};
  for (const pair of response.headers.entries()) {
    headers[pair[0]] = pair[1];
  }

  let content;
  if (
    headers['content-type'].includes('image') ||
    headers['content-type'].includes('video')
  ) {
    content = Buffer.from(await response.text(), 'base64');
  } else {
    content = await response.text();
  }

  return context.res.send(content, response.status, headers);
}
