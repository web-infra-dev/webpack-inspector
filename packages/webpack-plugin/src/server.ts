import Koa from 'koa';
import Router from 'koa-router';
import { ServerDataSource } from './types';
import cors from '@koa/cors';
import serve from 'koa-static';
import { join } from 'path';
import { readFile } from 'fs-extra';

export function createServer(data: ServerDataSource): Koa {
  const {
    moduleList,
    moduleTransformInfoMap,
    loaderInfoList,
    config,
    outputFiles,
  } = data;
  const app = new Koa();
  const router = new Router();

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
    const { default: stringify } = await import('json-stringify-safe');
    // @ts-ignore Insert plugin name to config
    config.plugins = config.plugins.map(plugin => ({
      ...plugin,
      __pluginName: plugin.constructor.name,
    }));
    const serializer = stringify.getSerialize();
    ctx.body = stringify(config, (_, value) => {
      if (value instanceof RegExp) {
        return value.source;
      }
      return serializer(_, value);
    });
  });

  router.get('/output', async (ctx, next) => {
    await next();
    ctx.body = outputFiles;
  });

  app.use(cors());
  app.use(serve(join(__dirname, '../client')));
  app.use(router.routes()).use(router.allowedMethods());
  app.use(async (ctx, next) => {
    await next();
    if (ctx.status === 404) {
      ctx.type = 'html';
      ctx.body = await readFile(
        join(__dirname, '../client/index.html'),
        'utf-8',
      );
    }
  });
  return app;
}
