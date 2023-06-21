import { chromium } from '@playwright/test';

import path from 'path';

const extensionPath = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'extension',
  'fnalonmlenogoaknbeikifdbaokkhmjj',
  '3.5.0_0',
);

console.log(extensionPath);

export async function consultDanfe(danfeAccessKey: string) {
  const userDataDir = '/tmp/test-user-data-dir';

  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chrome',
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      `--devtools=true`,
    ],
  });

  const mainPage = await browserContext.newPage();

  await mainPage.goto('https://www.fsist.com.br/');
  await mainPage.locator('input#chave').fill(danfeAccessKey);

  const pagePromise = browserContext.waitForEvent('page');
  await mainPage.click('td#butconsulta');

  const newPage = await pagePromise;
  await newPage.waitForLoadState();

  await newPage.check('div#checkbox');

  await newPage.close();

  await mainPage.close();

  console.log(extensionPath);
}
