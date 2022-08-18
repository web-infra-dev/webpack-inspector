import { page } from '../../vitestSetup';
import { beforeAll, expect, test, describe } from 'vitest';

describe('render inspector content', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3334');
    await page.waitForSelector('#app');
  });

  test('render title', async () => {
    const [title] = await page.locator('#app main nav span').allInnerTexts();

    expect(title).toBe('Webpack Inspect');
  });
});
