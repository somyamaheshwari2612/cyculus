import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

/**
 * Dev-only plugin to execute /api/extract locally using the exact same handler
 * that runs in production on Vercel, with request body parsing & res.status().json() shims.
 */
function localApiPlugin(): Plugin {
  return {
    name: 'local-api-handler',
    apply: 'serve', // Strictly dev only, never bundled into production build
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/extract' && req.method === 'POST') {
          try {
            // Buffer and parse the incoming JSON body
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            let parsedBody = {};
            try {
              parsedBody = rawBody ? JSON.parse(rawBody) : {};
            } catch (e) {
              parsedBody = {};
            }

            // Shim Vercel req.body
            (req as any).body = parsedBody;

            // Shim Vercel res.status() and res.json()
            let statusCode = 200;
            (res as any).status = (code: number) => {
              statusCode = code;
              res.statusCode = code;
              return res;
            };
            (res as any).json = (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = statusCode;
              res.end(JSON.stringify(data));
            };

            // Dynamically load the exact production handler via Vite's SSR module loader
            const extractModule = await server.ssrLoadModule('/api/extract.ts');
            const handler = extractModule.default;
            await handler(req, res);
          } catch (err: any) {
            console.error('Local API Handler Error:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({
              ok: false,
              error: err?.message || 'Internal dev server error during extraction'
            }));
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  // Load GEMINI_API_KEY strictly on the server-side Node process without VITE_ prefix
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }
  if (env.GEMINI_MODEL) {
    process.env.GEMINI_MODEL = env.GEMINI_MODEL;
  }

  return {
    plugins: [
      react(),
      localApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Cyculus · Private Cycle Tracking & Doctor Brief',
          short_name: 'Cyculus',
          description: 'Private, phone-first cycle diary with conversational capture and clinical briefs.',
          theme_color: '#7B5EA7',
          background_color: '#FDF7F9',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    test: {
      include: ['src/**/*.{test,spec}.{ts,tsx}']
    }
  };
});
