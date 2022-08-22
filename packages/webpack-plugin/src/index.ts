import { readFileSync } from 'fs';
import {
  Compiler,
  WebpackPluginInstance,
  Compilation,
  RuleSetRule,
  NormalModule,
  WebpackOptionsNormalized,
} from 'webpack';
import { loaderInfoMap, moduleInfoMap, moduleTransformInfoMap } from './loader';
import { hookNormalModuleLoader, isCI, NAME, prependLoader } from './utils';
import { createServer } from './server';
import { blue, bold } from 'picocolors';

export const INSPECT_PLUGIN = 'INSPECT_PLUGIN';

const DEFAULT_PROT = 3333;

interface PluginOptions {
  port?: number;
  ignorePattern?: RegExp | null;
}

export class InspectorWebpackPlugin implements WebpackPluginInstance {
  port: number;
  ignorePattern: RegExp | null;
  #hasServerOpened = false;
  constructor(options: PluginOptions = {}) {
    this.port = options.port || DEFAULT_PROT;
    this.ignorePattern = options.ignorePattern || null;
  }

  recordModuleDependencies(
    moduleInfo: NormalModule,
    compilation: Compilation,
  ): void {
    if (!moduleInfo || !moduleInfo.resource) {
      return;
    }
    const id = moduleInfo.resource;

    if (this.ignorePattern && this.ignorePattern.test(id)) {
      return;
    }

    if (id.startsWith('data:') || id.endsWith('.html')) {
      return;
    }

    if (!moduleInfoMap[id]) {
      moduleInfoMap[id] = {
        id,
        loaders: [],
        deps: [],
      };
    }

    if (!moduleTransformInfoMap[id]) {
      let fileContent;
      try {
        fileContent = readFileSync(
          moduleInfo.resourceResolveData.path,
          'utf-8',
        );
      } catch (e) {
        fileContent = 'Cannot read the content of module.';
      }
      moduleTransformInfoMap[id] = [
        {
          name: '__load__',
          result: fileContent,
          start: 0,
          end: 0,
        },
      ];
    }

    const { dependencies } = moduleInfo;
    dependencies.forEach(dep => {
      let depModule;
      if (compilation.moduleGraph) {
        depModule = compilation.moduleGraph.getModule(dep) as NormalModule;
      } else {
        // @ts-ignore Compat webpack4
        depModule = compilation.getDependencyReference(moduleInfo, dep);
        if (depModule) {
          depModule = depModule.module;
        }
      }

      if (
        depModule &&
        depModule.resource &&
        moduleInfoMap[id] &&
        !moduleInfoMap[id].deps.includes(depModule.resource)
      ) {
        moduleInfoMap[id].deps.push(depModule.resource);
      }
    });
  }

  apply(compiler: Compiler): void {
    let webpackConfig: WebpackOptionsNormalized;
    // skip in ci build
    if (isCI()) {
      return;
    }
    compiler.hooks.environment.tap(INSPECT_PLUGIN, () => {
      compiler.options.module.rules = prependLoader(
        compiler.options.module.rules,
      ) as (RuleSetRule | '...')[];
      compiler.options.cache = false;
      webpackConfig = compiler.options;
    });

    compiler.hooks.compilation.tap(NAME, (compilation: Compilation): void => {
      hookNormalModuleLoader(compilation, INSPECT_PLUGIN, loaderContext => {
        // @ts-ignore Hang ignorePattern on loader context, so we can exclude some module by the pattern.
        loaderContext.ignorePattern = this.ignorePattern;
      });
      compilation.hooks.moduleIds.tap(
        INSPECT_PLUGIN,
        (modules: NormalModule[]) => {
          for (const moduleInfo of modules) {
            this.recordModuleDependencies(moduleInfo, compilation);
          }
        },
      );
    });
    compiler.hooks.done.tapPromise(NAME, async () => {
      // @ts-ignore
      if (this.#hasServerOpened) {
        return;
      }
      const server = createServer({
        loaderInfoList: Object.values(loaderInfoMap),
        moduleList: {
          root: process.cwd(),
          modules: Object.values(moduleInfoMap),
        },
        moduleTransformInfoMap,
        config: webpackConfig,
      });
      this.#hasServerOpened = true;
      server.listen(this.port, () => {
        const banner = blue(bold('【Webpack Inspector】'));
        console.log(`${banner}🔥 started at http://localhost:${this.port}`);
      });
    });
  }
}
