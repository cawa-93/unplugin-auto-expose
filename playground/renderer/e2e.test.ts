import type {ElectronApplication} from 'playwright';
import {_electron as electron} from 'playwright';
import {afterAll, beforeAll, expect, test} from 'vitest';
import * as exposed from '../preload'
let electronApp: ElectronApplication;

beforeAll(async () => {
    electronApp = await electron.launch({
        args: ['.'],
    });
});

afterAll(async () => {
    await electronApp.close();
});

test('Preload versions', async () => {
    const page = await electronApp.firstWindow();
    const rendered = await page.locator('body').innerText();
    expect(JSON.parse(rendered)).deep.equal(JSON.parse(JSON.stringify(exposed)))
});
