# unplugin-auto-expose

Plugins for automatic `exposeInMainWorld` everething you exported from preload and easely importing exposed api in renderer.

---
[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct-single.svg)](https://stand-with-ukraine.pp.ua)
---


## Example
```ts
// /preload/index.ts
export const foo = 'foo string'
```
```ts
// /renderer/index.ts
import {foo} from '#preload'
console.log(foo)
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
// /preload/vite.config.ts

import {preload} from 'unplugin-auto-expose';

export default defineConfig({
  plugins: [
    preload.vite()
  ]
})
```
```ts
// /renderer/vite.config.ts

import {renderer} from 'unplugin-auto-expose';

export default defineConfig({
  plugins: [
    renderer.vite({
      preloadEntry: '/absolute/path/to/preload/index.ts'
    })
  ]
})
```
## TypeScript
To configurate the TypeScript, add a path to your renderer `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "#preload": [
        "/path/to/preload/index"
      ]
    }
  }
}

```
