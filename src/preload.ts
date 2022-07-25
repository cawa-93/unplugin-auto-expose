import { createUnplugin } from 'unplugin';
import { PreloadOptions } from './types';
import { PreRenderedChunk } from 'rollup';

export const preload = createUnplugin(
  (_options: PreloadOptions | undefined) => {
    return {
      // common unplugin hooks
      name: 'unplugin-auto-expose-preload',

      renderChunk(code: string, info: PreRenderedChunk) {
        if (!info.isEntry) {
          return;
        }
        code += "\nconst {contextBridge} = require('electron');\n";
        for (const exp of info.exports) {
          code += `;\ncontextBridge.exposeInMainWorld('__electron_preload__${exp}', exports.${exp});\n`;
        }
        return code;
      },
    };
  },
);
