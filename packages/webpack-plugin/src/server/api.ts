import { ServerDataSource } from '@/types';
import connect from 'connect';
import { ServerResponse } from 'http';
import stringify from 'json-stringify-safe';
import { join } from 'path';
import { parse } from 'querystring';
import { Router } from './Router';

const BLACK_KEY_LIST = ['coraCompiler', 'stats'];

export function apiMiddleware(
  data: ServerDataSource,
): connect.NextHandleFunction {
  const {
    moduleList,
    moduleTransformInfoMap,
    loaderInfoList,
    config,
    outputFiles,
    fs,
  } = data;
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
  const router = new Router();

  const sendResponse = (body: unknown, res: ServerResponse) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(stringify(body));
  };

  router.get('/module-list', async (_req, res, next) => {
    await next();
    sendResponse(moduleList, res);
  });

  router.get('/transform-list', async (req, res, next) => {
    const query = parse(req.url.split('?')[1]);
    const { id } = query as Record<string, string>;
    await next();
    sendResponse(
      {
        resolvedId: id,
        transforms: moduleTransformInfoMap[id],
      },
      res,
    );
  });
  router.get('/loader-list', async (_req, res, next) => {
    await next();
    sendResponse(loaderInfoList, res);
  });

  router.get('/config', async (_req, res, next) => {
    await next();
    res.setHeader('Content-Type', 'application/json');
    res.end(serializedConfig);
  });

  router.get('/output', async (_req, res, next) => {
    await next();
    sendResponse(outputFiles, res);
  });

  router.get('/chunk', async (req, res, next) => {
    await next();
    const query = parse(req.url.split('?')[1]);
    const fileName = query.file as string;
    sendResponse(
      fs.readFileSync(join(config.output.path, fileName), 'utf-8'),
      res,
    );
  });
  return router.routes();
}
