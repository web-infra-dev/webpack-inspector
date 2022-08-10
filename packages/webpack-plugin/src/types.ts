import { WebpackOptionsNormalized } from 'webpack';

export interface TransformItem {
  name: string;
  result: string;
  start: number;
  end: number;
}

export interface ModuleInfo {
  id: string;
  loaders: string[];
  deps: string[];
}

export interface ModuleList {
  root: string;
  modules: ModuleInfo[];
}

export interface LoaderInfo {
  name: string;
  totalTime: number;
  invokeCount: number;
}

export interface ServerDataSource {
  moduleList: ModuleList;
  moduleTransformInfoMap: Record<string, TransformItem[]>;
  loaderInfoList: LoaderInfo[];
  config: WebpackOptionsNormalized;
}
