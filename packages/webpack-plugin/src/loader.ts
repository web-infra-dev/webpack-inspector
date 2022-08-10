import {
  PitchLoaderDefinitionFunction,
  LoaderModule,
  LoaderDefinitionFunction,
  RawLoaderDefinitionFunction,
} from 'webpack';
import { LoaderInfo, ModuleInfo, TransformItem } from './types';
import { extractLoaderName, wrapLoaderRequire, NAME } from './utils';

export const raw = true;

export const moduleTransformInfoMap: Record<string, TransformItem[]> = {};
// key: module id,  value: raw content
export const moduleRawContentMap: Record<string, string> = {};
export const loaderInfoMap: Record<string, LoaderInfo> = {};
export const moduleInfoMap: Record<string, ModuleInfo> = {};

export function addTransformItem(id, transformItem: TransformItem): void {
  // 1. record transform map
  if (!moduleTransformInfoMap[id]) {
    moduleTransformInfoMap[id] = [
      {
        name: '__load__',
        result: moduleRawContentMap[id],
        start: 0,
        end: 0,
      },
    ];
  }
  const existedLoaderIndex = moduleTransformInfoMap[id].findIndex(
    ({ name }) => name === transformItem.name,
  );
  const hasExistedLoader = existedLoaderIndex !== -1;
  if (hasExistedLoader) {
    moduleTransformInfoMap[id].splice(existedLoaderIndex, 1, transformItem);
  } else {
    moduleTransformInfoMap[id].push(transformItem);
  }
  // 2. record loader meta info
  const loaderName = transformItem.name;
  if (!loaderInfoMap[loaderName]) {
    loaderInfoMap[loaderName] = {
      name: loaderName,
      invokeCount: 0,
      totalTime: 0,
    };
  }

  loaderInfoMap[loaderName].invokeCount++;

  if (hasExistedLoader) {
    loaderInfoMap[loaderName].invokeCount--;
  }

  loaderInfoMap[loaderName].totalTime +=
    transformItem.end - transformItem.start;
  // 3. record module info map
  if (!moduleInfoMap[id]) {
    moduleInfoMap[id] = {
      id,
      loaders: [],
      deps: [],
    };
  }
  if (!hasExistedLoader) {
    moduleInfoMap[id].loaders.push(loaderName);
  }
}

export const pitch: PitchLoaderDefinitionFunction = function(): void {
  const loaderPaths = this.loaders
    .map(loader => loader.path)
    .filter(loaderPath => !loaderPath.includes(NAME));
  // @ts-ignore We have hang ignorePatter in normalModuleLoader hook.
  const { ignorePattern } = this;
  wrapLoaderRequire(
    loaderPaths,
    (loaderModule: LoaderModule, loaderPath: string): LoaderModule => {
      const loaderName = extractLoaderName(loaderPath);
      const wrapLoaderFunction = (
        func: LoaderDefinitionFunction | RawLoaderDefinitionFunction,
      ) =>
        function(...args): void {
          const module = this.resourcePath;
          if (ignorePattern && ignorePattern.test(module)) {
            return func.apply(this, args);
          }

          if (loaderPath === loaderPaths.slice().pop()) {
            [moduleRawContentMap[module]] = args;
          }
          // Intercept async and callback in loader context
          // So we can get the loader transform result.
          const startTime = Date.now();
          const proxyThis = Object.assign({}, this, {
            async: function(...asyncArgs): (...callbackArgs) => void {
              const asyncCallback = this.async(...asyncArgs);
              return function(...callbackArgs): void {
                addTransformItem(module, {
                  name: loaderName,
                  result: callbackArgs[1],
                  start: startTime,
                  end: Date.now(),
                });
                return asyncCallback.apply(this, callbackArgs);
              };
            }.bind(this),
            callback: function(...callbackArgs): void {
              const { callback } = this;
              addTransformItem(module, {
                name: loaderName,
                result: callbackArgs[1],
                start: startTime,
                end: Date.now(),
              });
              return callback.apply(this, callbackArgs);
            }.bind(this),
          });

          const ret = func.apply(proxyThis, args);

          if (ret) {
            addTransformItem(module, {
              name: loaderName,
              result: ret,
              start: startTime,
              end: Date.now(),
            });
          }

          return ret;
        };

      if (typeof loaderModule.default === 'function') {
        loaderModule.default = wrapLoaderFunction(
          loaderModule.default,
        ) as LoaderDefinitionFunction;
      }

      if (typeof loaderModule === 'function') {
        return wrapLoaderFunction(loaderModule) as LoaderModule;
      }

      return loaderModule;
    },
  );
};
