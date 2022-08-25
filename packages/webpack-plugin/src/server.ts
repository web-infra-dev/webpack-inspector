import Koa from 'koa';
import Router from 'koa-router';
import { ServerDataSource } from './types';
import cors from '@koa/cors';
import serve from 'koa-static';
import { join } from 'path';
import { readFile } from 'fs-extra';
import stringify from 'json-stringify-safe';

const BLACK_KEY_LIST = ['coraCompiler', 'stats'];

export function createServer(data: ServerDataSource): Koa {
  const {
    moduleList,
    moduleTransformInfoMap,
    loaderInfoList,
    config,
    outputFiles,
    fs,
  } = data;
  const app = new Koa();
  const router = new Router();
  // @ts-ignore Attach plugin name.
  config.plugins = config.plugins.map(plugin => ({
    ...plugin,
    __pluginName: plugin.constructor.name,
  }));
  const serializer = stringify.getSerialize();
  const serializedConfig = stringify(config, (key, value) => {
    if (BLACK_KEY_LIST.includes(key)) {
      // To avoid huge performance impact, we don't serialize some keys.
      return undefined;
    }
    if (value instanceof RegExp) {
      return value.source;
    }
    return serializer(key, value);
  });

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
    ctx.body = serializedConfig;
  });

  router.get('/output', async (ctx, next) => {
    await next();
    ctx.body = outputFiles;
  });

  router.get('/chunk', async (ctx, next) => {
    await next();
    const fileName = ctx.query.file;
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
