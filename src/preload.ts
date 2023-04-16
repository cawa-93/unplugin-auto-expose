import { createUnplugin } from 'unplugin';
import type { PreloadOptions } from './types';
import type { PreRenderedChunk } from 'rollup';
import MagicString from 'magic-string';
import { generateExposedName } from './util';

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
        const noContextBridge =
          _options &&
          _options.noContextBridgeEntries &&
          _options.noContextBridgeEntries.includes(info.name);
        if (!noContextBridge) {
          transformed.append(
            "\nconst {contextBridge} = require('electron');\n",
          );
        }
        for (const exp of info.exports) {
          const exposedName = generateExposedName(exp, _options);
          if (noContextBridge) {
            transformed.append(`;\nwindow.${exposedName} = exports.${exp};\n`);
          } else {
            transformed.append(
              `;\ncontextBridge.exposeInMainWorld('${exposedName}', exports.${exp});\n`,
            );
          }
        }
        return {
          code: transformed.toString(),
          map: transformed.generateMap(),
        };
      },
    };
  },
);
