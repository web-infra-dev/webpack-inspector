import { ServerDataSource } from '../types';
import { join } from 'path';
import { readFile } from 'fs-extra';
import http from 'http';
import connect from 'connect';
import { apiMiddleware } from './api';
import sirv from 'sirv';
import { resolve } from '@/utils';
import cors from 'cors';

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
