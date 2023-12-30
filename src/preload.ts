import {createUnplugin} from 'unplugin';
import type {PreloadOptions} from './types';
import {MagicString} from 'magic-string-ast';

import {babelParse, getLang, walkAST} from 'ast-kit'

export const preload = createUnplugin(
    (_options: PreloadOptions | undefined) => {
        return {
            // common unplugin hooks
            name: 'unplugin-auto-expose-preload',
            enforce: 'pre',

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
                                        const names = node.declaration.declarations.map((d: any) => d.id.name)
                                        wasElectronUsed = true
                                        for (const name of names) {
                                            applyExposingToNode(node, name)
                                        }
                                    } else if (node.declaration.type === 'FunctionDeclaration') {
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
                    s.appendRight(node.loc.end.index, `;contextBridge.exposeInMainWorld('__electron_preload__${name}', ${localName || name});`)
                }

                return {
                    code: s.toString(),
                    get map() {
                        return s.generateMap({
                            source: id,
                            includeContent: true,
                        })
                    },
                }
            }
        };
    },
);

let index = 0;

function getVarName(p: string = '') {
    return `d${++index}${p}`
}
