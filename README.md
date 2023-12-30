> [!NOTE]
>
> Due to the ongoing war resulting from Russia's full-scale invasion of Ukraine, I currently lack the time for the full development of this open-source project. My primary focus is on ensuring the well-being of myself and my family. I'll prioritize and review all new contributions as soon as possible.
>
> If you can, please consider [supporting Ukraine](https://stand-with-ukraine.pp.ua/) or [me personally](https://www.buymeacoffee.com/kozack). 
>
> Thank you for your understanding and support.
---

# unplugin-auto-expose

Plugins for automatic `exposeInMainWorld`. Easily export your exposed api from `preload`  to `renderer`.

## Example
```ts
// preload.ts
export const foo = 'foo string'
// Equivalent
electron.contextBridge.exposeInMainWorld('__electron_preload_foo', 'foo string')
```
```ts
// renderer.ts
import {foo} from '#preload'
// Equivalent
const foo = window.__electron_preload_foo
```

## Limitation
Currently, only the input file is analyzed. This means that you cannot re-export anything from other modules without specifying the names
```ts
export * from 'file' // ❌ Will not work

export * as props from 'file' // ✔
export {prop} from 'file' // ✔
export {prop as propAlias} from 'file' // ✔
```

## Configuration
This package contains two plugins: one for preload and one for renderer builds.
```ts
// preload/vite.config.ts

import {preload} from 'unplugin-auto-expose';

export default defineConfig({
  plugins: [
    preload.vite()
  ]
})
```
```ts
// renderer/vite.config.ts

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
To configure the TypeScript, add a path to your renderer.

```json5
// tsconfig.json`:
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
