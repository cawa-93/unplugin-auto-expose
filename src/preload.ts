import { createUnplugin } from 'unplugin';
import type { PreloadOptions } from './types';
import type { PreRenderedChunk } from 'rollup';
import MagicString from 'magic-string';

export const preload = createUnplugin(
  (_options: PreloadOptions | undefined) => {
    return {
      // common unplugin hooks
      name: 'unplugin-auto-expose-preload',

      renderChunk(code: string, info: PreRenderedChunk) {
        if (!info.isEntry) {
          return;
        }
        const transformed = new MagicString(code);
        transformed.append("\nconst {contextBridge} = require('electron');\n");
        for (const exp of info.exports) {
          transformed.append(
            `;\ncontextBridge.exposeInMainWorld('__electron_preload__${exp}', exports.${exp});\n`,
          );
        }
        return {
          code: transformed.toString(),
          map: transformed.generateMap(),
        };
      },
    };
  },
);
