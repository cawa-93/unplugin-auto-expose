import {createUnplugin, createRollupPlugin} from 'unplugin';
import type {PreloadOptions} from './types';
import type {PreRenderedChunk} from 'rollup';
import {MagicString} from 'magic-string-ast';

import {babelParse, getLang, walkAST, walkASTAsync} from 'ast-kit'

function getInjectCode(names: string[]) {
    if (!names?.length) {
        return '';
    }

    let code = '\nimport {contextBridge} from \'electron\';\nconsole.log(module)'
    for (const name of names) {
        code += `;contextBridge.exposeInMainWorld('__electron_preload__${name}',  exports.${name === 'default' ? 'index' : name});\n`;
    }

    return code;
}

export const preload = createRollupPlugin(
    (_options: PreloadOptions | undefined) => {
        return {
            // common unplugin hooks
            name: 'unplugin-auto-expose-preload',
            enforce: 'pre',

            // renderChunk(code: string, info: PreRenderedChunk) {
            //   if (!info.isEntry) {
            //     return;
            //   }
            //   const transformed = new MagicString(code);
            //   transformed.append("\nconst {contextBridge} = require('electron');\n");
            //   for (const exp of info.exports) {
            //     transformed.append(
            //       `;\ncontextBridge.exposeInMainWorld('__electron_preload__${exp}', exports.${exp});\n`,
            //     );
            //   }
            //   return {
            //     code: transformed.toString(),
            //     map: transformed.generateMap(),
            //   };
            // },

            transform(code, id, ...dara) {
                const moduleInfo = this.getModuleInfo(id);
                if (!moduleInfo.isEntry || moduleInfo.isExternal) {
                    return;
                }

                let wasElectronUsed = false;

                const s = new MagicString(code)
                const program = babelParse(code, getLang(id));

                walkAST(program, {
                    async enter(node, parent, key, index) {
                        switch (node.type) {
                            case 'ExportNamedDeclaration' :
                                if (node.declaration) {
                                    if (node.declaration.type === 'VariableDeclaration') {
                                        const names = node.declaration.declarations.map(d => d.id.name)
                                        wasElectronUsed = true
                                        for (const name of names) {
                                            applyExposingToNode(node, name)
                                        }
                                    } else
                                        if (node.declaration.type === 'FunctionDeclaration') {
                                        wasElectronUsed = true
                                        applyExposingToNode(node, node.declaration.id.name)

                                    }
                                } else if (node.specifiers) {
                                    wasElectronUsed = true
                                    for (const specifier of node.specifiers) {
                                        if (specifier.type === 'ExportSpecifier') {

                                            applyExposingToNode(node, specifier.exported.name)
                                            // varNames.push(specifier.local.name)
                                        } else if (specifier.type === 'ExportNamespaceSpecifier') {
                                            applyExposingToNode(node, specifier.exported.name)
                                        }
                                    }

                                    let ex = ';' + s.slice(node.loc.start.index, node.loc.end.index) + ';'
                                    s.prependRight(node.loc.end.index, ex.replace('export', 'import'))
                                }

                                break;
                            case 'ExportDefaultDeclaration':
                                const value = s.slice(node.declaration.start, node.declaration.end)
                                const name = getVarName();
                                console.log({name, value}, `;const ${name} = ${value}`)
                                s.overwriteNode(node, `;const ${name} = ${value};export default ${name};`)
                                applyExposingToNode(node, 'default', name)

                                break
                        }
                    },

                })

                if (wasElectronUsed) {
                    s.prepend('import {contextBridge} from \'electron\';\n')
                }

                function applyExposingToNode(node, name: string, localName: string | null = null) {
                    console.log(`;contextBridge.exposeInMainWorld('__electron_preload__${name}', ${localName || name});`)
                    s.appendRight(node.loc.end.index, `;contextBridge.exposeInMainWorld('__electron_preload__${name}', ${localName || name});`)
                }

                //
                // console.log(moduleInfo)
                // console.log(moduleInfo.exportedBindings)
                // console.log(moduleInfo.importers)
                // console.log(moduleInfo.importedIds)
                // console.log(moduleInfo.importedIdResolutions)
                return {
                    code: s.toString(),
                    get map() {
                        return s.generateMap({
                            source: id,
                            includeContent: true,
                        })
                    },
                }
                // console.log(info)
                // console.log(code)
                // return code + getInjectCode(info.exports)
            }
        };
    },
);

let index = 0;
function getVarName(p: string = '') {
    return `d${++index}${p}`
}
