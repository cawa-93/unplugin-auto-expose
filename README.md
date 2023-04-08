[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct-single.svg)](https://stand-with-ukraine.pp.ua)

---

# unplugin-auto-expose
<a href="https://www.buymeacoffee.com/kozack" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" height="60" alt="Buy Me A Coffee"></a>

Plugins for automatic `exposeInMainWorld` everything you exported from preload and easily importing exposed api in renderer.

## Example
```ts
/// preload.ts
export const foo = 'foo string'
// Equivalent
electron.contextBridge.exposeInMainWorld('__electron_preload_foo__', 'foo string')
```
```ts
/// renderer.ts
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
This package contains two plugins: for prelaod and renderer builds
```ts
/// preload/vite.config.ts

import {preload} from 'unplugin-auto-expose';

export default defineConfig({
  plugins: [
    preload.vite()
  ]
})
```
```ts
/// renderer/vite.config.ts

import {renderer} from 'unplugin-auto-expose';

export default defineConfig({
  plugins: [
    renderer.vite({
      preloadEntry: '/absolute/path/to/preload.ts'
    })
  ]
})
```
## TypeScript
To configure the TypeScript, add a path to your renderer 

```json
/// tsconfig.json`:
{
  "compilerOptions": {
    "paths": {
      "#preload": [
        "/path/to/preload"
      ]
    }
  }
}

```
