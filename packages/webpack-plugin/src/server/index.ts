import { ServerDataSource } from '../types';
import { join } from 'path';
import { readFile } from 'fs-extra';
import http from 'http';
import connect from 'connect';
import { apiMiddleware } from './api';
import sirv from 'sirv';
import { resolve } from '@/utils';
import cors from 'cors';
import { blue, bold } from 'picocolors';

export function createServer(data: ServerDataSource): http.Server {
  const middlewares = connect();
  middlewares.use(apiMiddleware(data));
  middlewares.use(sirv(resolve('client'), { dev: true, etag: true }));
  // Fallback to index.html
  middlewares.use(async (_req, res, next) => {
    await next();
    if (!res.writableEnded) {
      res.setHeader('Content-Type', 'text/html');
      res.end(await readFile(resolve('client/index.html'), 'utf-8'));
    }
  });
  middlewares.use(cors());
  const app = http.createServer(middlewares);

  return app;
}

export function startHttpServer(server: http.Server, expectPort: number) {
  let port = expectPort;
  let hasPrinted = false;
  return new Promise((resolve, reject) => {
    const onSuccess = () => {
      if (!hasPrinted) {
        const banner = blue(bold('【Webpack Inspector】'));
        console.log(`${banner}🔥 started at http://localhost:${port}`);
      }
      server.removeListener('error', onError);
      hasPrinted = true;
      resolve(port);
    };
    const onError = (e: Error & { code?: string }) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying another one...`);
        server.listen(++port, onSuccess);
      } else {
        server.removeListener('error', onError);
        reject(e);
      }
    };
    server.on('error', onError);
    server.listen(port, onSuccess);
  });
}
