import { join } from 'path';
import { extractLoaderName, wrapLoaderRequire } from '../utils';
import Module from 'module';

describe('loader path function', () => {
  test('extract loader name', () => {
    // windows
    expect(
      extractLoaderName(
        'C:\\user\\project\\node_modules\\css-loader\\index.js',
      ),
    ).toBe('css-loader');
    // npm/yarn
    expect(
      extractLoaderName('/user/project/node_modules/css-loader/index.js'),
    ).toBe('css-loader');
    // pnpm
    expect(
      extractLoaderName(
        '/user/project/node_modules/.pnpm/css-loader@4.2/node_modules/css-loader/index.js',
      ),
    ).toBe('css-loader');
  });

  test('intercept require', () => {
    const testFilePath = join(__dirname, './test.js');
    const mockFn = jest.fn();
    wrapLoaderRequire([testFilePath], (requireResult, loaderRealPath) => {
      mockFn();
      return requireResult;
    });
    // test require
    Module.prototype.require(testFilePath);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
