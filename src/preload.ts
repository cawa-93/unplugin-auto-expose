import { createUnplugin } from "unplugin";
import { PreloadOptions } from "./types";

export const preload = createUnplugin((options: PreloadOptions, meta) => {

    return {
        // common unplugin hooks
        name: 'unplugin-auto-expose-preload',

        renderChunk(code, info) {
            if (!info.isEntry) {
                return;
            }
            code += '\nconst {contextBridge} = require(\'electron\');\n';
            for (const exp of info.exports) {
                code += `;\ncontextBridge.exposeInMainWorld('__electron_preload__${exp}', exports.${exp});\n`;
            }
            return code;
        }
    }
})
