import fs from 'fs-extra';
import * as http from 'http';
import os from 'os';
import { join, resolve } from 'path';
import type { Browser, Page } from 'playwright-chromium';
import { chromium } from 'playwright-chromium';
import type { File } from 'vitest';
import { beforeAll } from 'vitest';
// #region env

export const workspaceRoot = resolve(__dirname, '../');

export const isBuild = !!process.env.VITE_TEST_BUILD;
export const isServe = !isBuild;
export const isWindows = process.platform === 'win32';
// #endregion

// #region context

export let rootDir: string;
/**
 * Path to the current test file
 */
export let testPath: string;
/**
 * Path to the test folder
 */
export let testDir: string;
/**
 * Test folder name
 */
export let testName: string;

export const serverLogs: string[] = [];
export const browserLogs: string[] = [];
export const browserErrors: Error[] = [];

export let page: Page = undefined!;
export let browser: Browser = undefined!;
export let vitePressTestUrl: string = '';

// #endregion

const DIR = join(os.tmpdir(), 'vitest_playwright_global_setup');

beforeAll(async s => {
  const suite = s as File;
  // skip browser setup for non-playground tests
  if (!suite.filepath.includes('playground')) {
    return;
  }

  const wsEndpoint = fs.readFileSync(join(DIR, 'wsEndpoint'), 'utf-8');
  if (!wsEndpoint) {
    throw new Error('wsEndpoint not found');
  }

  browser = await chromium.connect(wsEndpoint);
  page = await browser.newPage();

  try {
    testPath = suite.filepath;
    let testName = slash(testPath).match(/playground\/([\w-]+)\//)?.[1];
    if (testName) {
      testDir = resolve(workspaceRoot, 'playground-temp', testName);
      const webpackPath = require.resolve('webpack', { paths: [testDir] });
      const webpack = require(webpackPath);
      const config = require(join(testDir, 'webpack.config.js'));
      const webpackInstance = webpack(config);
      await new Promise(resolve => webpackInstance.run(resolve));
    }
  } catch (e) {
    // Closing the page since an error in the setup, for example a runtime error
    // when building the playground should skip further tests.
    // If the page remains open, a command like `await page.click(...)` produces
    // a timeout with an exception that hides the real error in the console.
    await page.close();
    throw e;
  }

  return async () => {
    serverLogs.length = 0;
    await page?.close();
    if (browser) {
      await browser.close();
    }
  };
});

export function slash(p: string): string {
  return p.replace(/\\/g, '/');
}
