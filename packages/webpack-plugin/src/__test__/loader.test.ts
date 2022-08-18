import {
  addTransformItem,
  loaderInfoMap,
  moduleInfoMap,
  moduleRawContentMap,
  moduleTransformInfoMap,
} from '@/loader';
import { describe, test, expect } from 'vitest';
describe('test loader internal logic', () => {
  // mock module `a`
  moduleRawContentMap.a = 'content';
  test('add transform item', () => {
    addTransformItem('a', {
      name: 'loader-1',
      result: 'b',
      start: 0,
      end: 200,
    });
    expect(moduleInfoMap).toEqual({
      a: {
        id: 'a',
        loaders: ['loader-1'],
        // `deps` is specified in webpack moduleIds hook.
        deps: [],
      },
    });
    expect(moduleTransformInfoMap).toEqual({
      a: [
        {
          name: '__load__',
          result: 'content',
          start: 0,
          end: 0,
        },
        {
          name: 'loader-1',
          result: 'b',
          start: 0,
          end: 200,
        },
      ],
    });
    expect(loaderInfoMap).toEqual({
      'loader-1': {
        name: 'loader-1',
        invokeCount: 1,
        totalTime: 200,
      },
    });
  });
});
