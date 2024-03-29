import { createUnplugin } from 'unplugin';
import type { RendererOptions } from './types.js';
import { scanExports } from 'unimport';

export const renderer = createUnplugin(
  (options: RendererOptions | undefined) => {
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
      async load(id: string) {
        if (id === resolvedVirtualModuleId) {
          if (!options?.preloadEntry) {
            this.error(
              'Could not load preload module, did you forget to set preloadEntry in vite.config.ts?',
            );
            return;
          }
          const exp = await scanExports(options.preloadEntry, false);
          const names = new Set(exp.map((e) => e.name.replace(/^\.\.\./, '')));

          return [...names].reduce((code, name) => {
            const exportName =
              name === 'default' ? 'default' : `const ${name} =`;
            return (
              code +
              `export ${exportName} globalThis.__electron_preload__${name};\n`
            );
          }, '');
        }
      },
    };
  },
);
