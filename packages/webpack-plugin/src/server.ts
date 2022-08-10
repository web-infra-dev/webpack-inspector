import Koa from 'koa';
import Router from 'koa-router';
import { ServerDataSource } from './types';
import cors from '@koa/cors';
import serve from 'koa-static';
import { join } from 'path';

export function createServer(data: ServerDataSource): Koa {
  const { moduleList, moduleTransformInfoMap, loaderInfoList, config } = data;
  const app = new Koa();
  const router = new Router();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  config.plugins = config.plugins.map(p => p.constructor.name);

  router.get('/module-list', async (ctx, next) => {
    await next();
    ctx.body = moduleList;
  });

  router.get('/transform-list', async (ctx, next) => {
    const { id } = ctx.query as Record<string, string>;
    await next();
    ctx.body = {
      resolvedId: id,
      transforms: moduleTransformInfoMap[id],
    };
  });

  router.get('/loader-list', async (ctx, next) => {
    await next();
    ctx.body = loaderInfoList;
  });

  router.get('/config', async (ctx, next) => {
    await next();
    ctx.body = JSON.stringify(
      config,
      (_, v) => {
        if (typeof v === 'function' || v instanceof RegExp) {
          return v.toString();
        }
        return v;
      },
      2
    );
  });

  app.use(cors());
  app.use(serve(join(__dirname, '../client')));
  app.use(router.routes()).use(router.allowedMethods());

  return app;
}
