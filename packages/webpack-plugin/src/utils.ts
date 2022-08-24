import Module from 'module';
import { Compilation, RuleSetRule, RuleSetUseItem } from 'webpack';
import fs from 'fs';
import path from 'path';
import { Directory } from './types';

export const NAME = 'inspect-webpack-plugin';

export const isCI = (): boolean => Boolean(process.env.BUILD_VERION);

const originRequire = Module.prototype.require;

export function wrapLoaderRequire(
  loaderPaths: string[],
  callback: (result: any, id: string) => void,
): void {
  Module.prototype.require = new Proxy(Module.prototype.require, {
    // intercept origin require function
    apply(target, _this, argArray): any {
      const result = originRequire.apply(_this, argArray);
      const [moduleId] = argArray;
      if (loaderPaths.includes(moduleId) && result) {
        if (result.__iwp) {
          return result;
        }
        const interceptedResult = callback(result, moduleId);
        // @ts-ignore hang __iwp to avoid max stack error
        interceptedResult.__iwp = true;
        return interceptedResult;
      }
      return result;
    },
  });
}
export function normalizePath(p: string): string {
  return p.replace(/\\/g, '/');
}

export function extractLoaderName(loaderPath: string): string {
  const MODULE_DIR = 'node_modules';
  const normalized = normalizePath(loaderPath);
  const startIndex = normalized.lastIndexOf(MODULE_DIR) + MODULE_DIR.length + 1;
  const postLoaderPathFragment = normalized.slice(startIndex);
  let pkgName: string;
  if (postLoaderPathFragment.charAt(0) === '@') {
    const [scope, name] = postLoaderPathFragment.split('/');
    pkgName = `${scope}/${name}`;
  } else {
    [pkgName] = postLoaderPathFragment.split('/');
  }
  return pkgName.endsWith('-loader') ? pkgName : postLoaderPathFragment;
}

function findLoaderIndex(name: string, uses: RuleSetUseItem[]): number {
  return uses.findIndex((item: RuleSetUseItem) => {
    if (typeof item === 'string') {
      return item.includes(name);
    }

    if ('loader' in item) {
      return item.loader.includes(name);
    }
    return false;
  });
}

// add inspector loader before existed loaders for every rule
export function prependLoader(
  rules: (RuleSetRule | '...') | (RuleSetRule | '...')[],
): (RuleSetRule | '...') | (RuleSetRule | '...')[] {
  if (typeof rules === 'string') {
    return rules;
  }
  if (Array.isArray(rules)) {
    return rules.map(prependLoader) as (RuleSetRule | '...')[];
  }
  if (rules.loader) {
    rules.use = [rules.loader];
    if (rules.options) {
      rules.use[0] = {
        loader: rules.loader,
        options: rules.options,
      };
      delete rules.options;
    }
    delete rules.loader;
  }

  if (rules.use) {
    if (!Array.isArray(rules.use)) {
      rules.use = [rules.use];
    }
    const threadLoaderIndex = findLoaderIndex('thread-loader', rules.use);
    if (threadLoaderIndex !== -1) {
      rules.use.splice(threadLoaderIndex, 1);
    }
    const styleLoaderIndex = findLoaderIndex('style-loader', rules.use);
    if (styleLoaderIndex !== -1) {
      rules.use.splice(styleLoaderIndex + 1, 0, require.resolve('./loader'));
    } else {
      rules.use.unshift(require.resolve('./loader'));
    }
  }

  if (rules.oneOf) {
    rules.oneOf = prependLoader(rules.oneOf) as RuleSetRule[];
  }
  if (rules.rules) {
    rules.rules = prependLoader(rules.rules) as RuleSetRule[];
  }
  return rules;
}

export function hookNormalModuleLoader(
  compilation: Compilation,
  pluginName: string,
  callback: (loaderContext: any) => void,
): void {
  // TODO: webpack 5 new API support，compat Eden And Jupiter because we need webpack instance here
  // if (NormalModule.getCompilationHooks) {
  //   // for webpack 5
  //   NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, callback);
  // } else if (compilation.hooks) {
  // for webpack 4
  compilation.hooks.normalModuleLoader.tap(pluginName, callback);
  // }
}

export function readDirectory(
  dir: string,
  fileSystem: typeof fs,
  rootPath: string,
  publicPath: string,
): Directory {
  const directory: Directory = {
    path: dir === rootPath ? rootPath : path.relative(rootPath, dir),
    children: [],
  };

  const items = fileSystem.readdirSync(dir);

  items.forEach(item => {
    const absItemPath = path.join(dir, item);
    const relativeItemPath = path.relative(rootPath, absItemPath);
    if (fileSystem.statSync(absItemPath).isDirectory()) {
      directory.children.push(
        readDirectory(absItemPath, fileSystem, rootPath, publicPath),
      );
    } else {
      directory.children.push({
        path: path.join(publicPath, relativeItemPath),
      });
    }
  });

  return directory;
}
