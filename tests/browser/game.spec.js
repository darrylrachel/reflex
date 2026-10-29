import { test, expect } from '@playwright/test';
test('desktop, tablet and phone layouts have no horizontal overflow', async ({page})=>{
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/'); await expect(page.locator('#scene canvas')).toBeVisible(); await page.evaluate(()=>document.fonts.ready);
  for(const [name,width,height] of [['desktop',1440,1100],['tablet',768,1024],['phone',390,844]]) {
    await page.setViewportSize({width,height}); await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`outputs/REFLEX-${name}.png`,fullPage:true});
  }
  expect(errors).toEqual([]);
});
test('mouse gameplay, early input, completion, persistence and confirmed reset', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('#status-title')).toHaveText('Ready when you are.');
  await page.getByRole('button',{name:'Start test'}).click(); await page.locator('#hit').click(); await expect(page.locator('#status-title')).toHaveText('Too Soon!'); await expect(page.locator('#attempts')).toHaveText('0');
  await page.getByRole('button',{name:'Try again'}).click(); await expect(page.locator('#stage')).toHaveAttribute('data-state','ready',{timeout:7000}); await page.locator('#hit').click(); await expect(page.locator('#attempts')).toHaveText('1'); await expect(page.locator('#status-title')).toHaveText(/\d+ ms/);
  await page.reload(); await expect(page.locator('#attempts')).toHaveText('1'); await page.locator('#reset').click(); await page.getByRole('button',{name:'Keep statistics'}).click(); await expect(page.locator('#attempts')).toHaveText('1'); await page.locator('#reset').click(); await page.getByRole('button',{name:'Reset statistics',exact:true}).click(); await expect(page.locator('#attempts')).toHaveText('0');
});
test('keyboard, reduced motion, live scene colors and resizing', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/'); await expect(page.locator('#scene canvas')).toBeVisible();
  const before = await page.locator('#scene canvas').screenshot(); await page.waitForTimeout(150); expect(await page.locator('#scene canvas').screenshot()).toEqual(before);
  await page.keyboard.press('Space'); await expect(page.locator('#stage')).toHaveAttribute('data-state','waiting'); const red = await page.locator('#scene canvas').screenshot(); expect(red.equals(before)).toBe(false);
  await expect(page.locator('#stage')).toHaveAttribute('data-state','ready',{timeout:7000}); const green = await page.locator('#scene canvas').screenshot(); expect(green.equals(red)).toBe(false); await page.keyboard.press('Space'); await expect(page.locator('#attempts')).toHaveText('1');
  await page.setViewportSize({width:390,height:844});
  const canvas = page.locator('#scene canvas');
  await expect(canvas).toBeVisible();
  // ResizeObserver updates the renderer asynchronously after layout.
  await expect.poll(async () => (await canvas.boundingBox())?.width ?? Infinity).toBeLessThan(390);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('touch and non-WebGL fallback remain playable with blocked storage', async ({ browser }) => {
  const context = await browser.newContext({viewport:{width:375,height:812},hasTouch:true,isMobile:true}); const page=await context.newPage();
  await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null; Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});
  await page.goto('/'); await expect(page.locator('.fallback')).toBeVisible(); await page.locator('#action').tap(); await expect(page.locator('#stage')).toHaveAttribute('data-state','ready',{timeout:7000}); await page.locator('#hit').tap(); await expect(page.locator('#attempts')).toHaveText('1'); await expect(page.locator('#storage-note')).toContainText('Storage unavailable'); await context.close();
});
test('context loss switches to fallback and hidden tab cancels round', async ({page})=>{
  await page.goto('/'); await expect(page.locator('#scene canvas')).toBeVisible(); await page.locator('#scene canvas').evaluate(canvas=>canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}))); await expect(page.locator('.fallback')).toBeVisible(); await page.locator('#action').click(); await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true}); document.dispatchEvent(new Event('visibilitychange'));}); await expect(page.locator('#stage')).toHaveAttribute('data-state','interrupted'); await expect(page.locator('#attempts')).toHaveText('0');
});
