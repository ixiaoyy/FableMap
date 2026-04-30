const { test, expect } = require('playwright/test');
test('smoke import', async ({ page }) => {
  expect(1).toBe(1);
});
