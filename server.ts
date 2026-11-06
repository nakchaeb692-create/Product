import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'StockPulse API', timestamp: new Date().toISOString() });
});

// Google Apps Script Proxy endpoint to cleanly bypass CORS preflight and redirect issues
app.all('/api/apps-script/proxy', async (req, res) => {
  const targetUrl = (req.query.url as string) || (req.body && req.body._targetUrl);
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid target url parameter' });
  }

  // Validate URL protocol
  try {
    const parsedUrl = new URL(targetUrl.trim());
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return res.status(400).json({ error: 'Invalid URL protocol. Must be http or https.' });
    }
  } catch {
    return res.status(400).json({ error: 'Malformed target URL.' });
  }

  try {
    const method = req.method;
    let finalUrl = targetUrl.trim();
    
    // Set 15-second timeout to prevent hung requests
    const fetchOptions: RequestInit = {
      method: method,
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    };

    if (method === 'GET') {
      try {
        const urlObj = new URL(finalUrl);
        for (const [key, value] of Object.entries(req.query)) {
          if (key !== 'url') {
            urlObj.searchParams.set(key, String(value));
          }
        }
        finalUrl = urlObj.toString();
      } catch (e) {
        // Fallback to original url
      }
    } else {
      // POST or other methods
      const { _targetUrl, ...payload } = req.body || {};
      fetchOptions.headers = {
        'Content-Type': 'application/json',
      };
      fetchOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(finalUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    if (contentType.includes('application/json')) {
      try {
        return res.status(response.status).json(JSON.parse(text));
      } catch {
        return res.status(response.status).send(text);
      }
    } else {
      try {
        // Sometimes Google Apps Script sends text/plain with JSON inside
        const parsed = JSON.parse(text);
        return res.status(response.status).json(parsed);
      } catch {
        return res.status(response.status).send(text);
      }
    }
  } catch (err: any) {
    console.error('Apps Script proxy error:', err);
    const isTimeout = err?.name === 'TimeoutError' || err?.message?.includes('timeout');
    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout ? 'Request timed out after 15 seconds' : 'Proxy request failed',
      details: err?.message || String(err)
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`StockPulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
