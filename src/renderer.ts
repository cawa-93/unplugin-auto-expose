import { createUnplugin } from 'unplugin';
import { RendererOptions } from './types';
import { scanExports } from './scanExports';

export const renderer = createUnplugin((options: RendererOptions) => {
  const virtualModuleId = '#preload';
  const resolvedVirtualModuleId = '\0' + virtualModuleId.replace('#', '@');

  return {
    name: 'unplugin-auto-expose-renderer',

    resolveId(source) {
      if (source === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    /**
     *
     * @param {string} id
     * @returns {Promise<*>}
     */
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const exp = await scanExports(options.preloadEntry);

        const names = new Set(
          exp.map((e) => (e.as === 'src' ? 'default' : e.as)),
        );
        return [...names].reduce((code, name) => {
          return (
            code +
            `export ${
              name === 'default' ? 'default' : `const ${name} =`
            } globalThis.__electron_preload__${name};\n`
          );
        }, '');
      }
    },
  };
});
