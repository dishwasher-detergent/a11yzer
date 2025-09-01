import { Hono } from 'hono';

export function Analyze(app: Hono, cacheDuration: number = 1440) {
  app.post('/analyze', async (c) => {
    const url = c.req.param('url');

    if (!url) {
      return c.json({ error: 'URL is required.' }, 400);
    }

    const urlDecoded = decodeURIComponent(url);

    return c.json({ error: 'Failed with no message.' }, 500);
  });
}
