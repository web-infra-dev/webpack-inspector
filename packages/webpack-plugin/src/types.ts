import { WebpackOptionsNormalized } from 'webpack';
import fs from 'fs';

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

export interface File {
  path: string;
  async: boolean;
}

export interface Directory {
  path: string;
  children: Array<File | Directory>;
}

export interface ServerDataSource {
  moduleList: ModuleList;
  moduleTransformInfoMap: Record<string, TransformItem[]>;
  loaderInfoList: LoaderInfo[];
  config: WebpackOptionsNormalized;
  outputFiles: Directory;
  fs: typeof fs;
}
