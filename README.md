# unplugin-auto-expose

## Example
```ts
// /preload/index.ts
export foo = 'foo string'
```
```ts
// /renderer/index.ts
import {foo} from '#preload'
console.log(foo)
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
