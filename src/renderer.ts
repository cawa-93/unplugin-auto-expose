import { createUnplugin } from 'unplugin';
import type { RendererOptions } from './types';
import { scanExports } from './scanExports';
import { generateExposedName } from './util';

export const renderer = createUnplugin((options: RendererOptions) => {
  if (!options.preloadEntry && !options.virtualModuleMap) {
    throw new Error('preloadEntry and virtualModuleMap cannot be both empty!');
  }
  const virtualModuleMap = options.virtualModuleMap || {
    '#preload': options.preloadEntry as string,
  };
  const virtualIdToResolvedId: Record<string, string> = {};
  const resolvedIdToPreloadEntry: Record<string, string> = {};

  Object.entries(virtualModuleMap).forEach(([virtualModuleId, entry]) => {
    const resolvedId = '\0' + virtualModuleId.replace('#', '@');
    virtualIdToResolvedId[virtualModuleId] = resolvedId;
    resolvedIdToPreloadEntry[resolvedId] = entry;
  });
  return {
    name: 'unplugin-auto-expose-renderer',

    resolveId(source) {
      if (virtualIdToResolvedId[source]) {
        return virtualIdToResolvedId[source];
      }
    },
    /**
     *
     * @param {string} id
     * @returns {Promise<*>}
     */
    async load(id: string) {
      if (id in resolvedIdToPreloadEntry) {
        const exp = await scanExports(resolvedIdToPreloadEntry[id]);

        const names = new Set(
          exp.map((e) => (e.as === 'src' ? 'default' : e.as)),
        );

        return [...names].reduce((code, name) => {
          const exportName = name === 'default' ? 'default' : `const ${name} =`;
          const exposedName = generateExposedName(name, options);
          return code + `export ${exportName} globalThis.${exposedName};\n`;
        }, '');
      }
    },
  };
});
