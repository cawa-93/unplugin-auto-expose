[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct-single.svg)](https://stand-with-ukraine.pp.ua)

---

# unplugin-auto-expose
<a href="https://www.buymeacoffee.com/kozack" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" height="60" alt="Buy Me A Coffee"></a>

Plugins for automatic `exposeInMainWorld`. Easily export your exposed api from `preload`  to `renderer`.

## Example
```ts
// preload.ts
export const foo = 'foo string'
// Equivalent
electron.contextBridge.exposeInMainWorld('__electron_preload_foo__', 'foo string')
```
```ts
// renderer.ts
import {foo} from '#preload'
// Equivalent
const foo = window.__electron_preload_foo__
```

## Limitation
Only _named exports_ are supported.
```ts
export * from 'file' // ❌ Will not work
export {prop} from 'file' // ✔

export * as props from 'file' // ❌ Will not work
import * as file from 'file' 
export const props = file // ⚠ Will work but not recommended for security reasons
```

## Configuration
This package contains two plugins: one for preload and one for renderer builds.
```ts
// preload/vite.config.ts

import {preload} from 'unplugin-auto-expose';

export default defineConfig({
  plugins: [
    preload.vite({
      exposeName: (name) => name, // must be same as config in renderer config
      noContextBridgeEntries: [], // fill filename without .ts here if you must set contextIsolation to false for some window, eg ['preload2']
    })
  ]
})
```
```ts
// renderer/vite.config.ts

import {renderer} from 'unplugin-auto-expose';

export default defineConfig({
  plugins: [
    renderer.vite({
      exposeName: (name) => name, // must be same as config in preload config
      virtualModuleMap: {
        '#preload1': '/absolute/path/to/preload1.ts',
        '#preload2': '/absolute/path/to/preload2.ts',
      }
    })
  ]
})
```
## TypeScript
To configure the TypeScript, add a path to your renderer.

```ts
// tsconfig.json`:
{
  "compilerOptions": {
    "paths": {
      "#preload1": [
        "/path/to/preload1"
      ],
      "#preload2": [
        "/path/to/preload2"
      ],
    }
  }
}

```
