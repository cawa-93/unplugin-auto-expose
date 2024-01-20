import * as path from "node:path";
import {createUnplugin} from 'unplugin';
import {MagicString} from 'magic-string-ast';
import {getAST} from "./parser.js";
import {
    type ExportAllDeclaration,
    type ExportDefaultDeclaration,
    type ExportNamedDeclaration,
    isArrayPattern,
    isExportNamespaceSpecifier,
    isExportSpecifier,
    isFunctionDeclaration,
    isIdentifier,
    isObjectPattern,
    isObjectProperty,
    isRestElement,
    isVariableDeclaration,
    type Node
} from "@babel/types";

import traverseModule from "@babel/traverse";
const traverse = traverseModule.default

export const preload = createUnplugin(
    () => {
        const __entries = new Set();

        function normalizePath(id: string) {
            return path.normalize(id)
        }


        return {
            name: 'unplugin-auto-expose-preload',
            enforce: 'pre',


            resolveId(id, importer, options) {
                if (options.isEntry) {
                    __entries.add(normalizePath(id))
                }

                return null
            },


            transform(code, id) {
                if (!__entries.has(normalizePath(id))) {
                    return;
                }

                const s = new MagicString(code)
                const program = getAST(code, id);

                traverse(program, {
                    ExportNamedDeclaration(path) {
                        handleExportNamedDeclaration(path.node, s)
                    },
                    ExportDefaultDeclaration(path) {
                        handleExportDefaultDeclaration(path.node, s)
                    },
                    ExportAllDeclaration(path) {
                        handleExportAllDeclaration(path.node, s)
                    },
                })

                s.prepend('import {contextBridge} from \'electron\';\n')

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


function getExposeInMainWorldCall(name: string, localName: string | null = null) {
    return `contextBridge.exposeInMainWorld('__electron_preload__${name}', ${localName || name})`
}

function handleExportNamedDeclaration(node: ExportNamedDeclaration, code: MagicString) {
    if (!node.loc) {
        return
    }


    if (isVariableDeclaration(node.declaration)) {
        for (const declarator of node.declaration.declarations) {
            if (isIdentifier(declarator.id)) {
                applyExposingToNode(code, node, declarator.id.name)
                continue;
            }

            if (isObjectPattern(declarator.id) || isArrayPattern(declarator.id)) {
                const properties = isObjectPattern(declarator.id) ? declarator.id.properties : declarator.id.elements
                for (const property of properties) {
                    const identifier = isObjectProperty(property) ? property.value : isRestElement(property) ? property.argument : property
                    if (!isIdentifier(identifier)) {
                        continue
                    }

                    applyExposingToNode(code, node, identifier.name)
                }

                // noinspection UnnecessaryContinueJS
                continue
            }
        }
        return;
    }

    if (isFunctionDeclaration(node.declaration) && node.declaration?.id?.name) {
        applyExposingToNode(code, node, node.declaration.id.name)
        return;
    }

    if (node.specifiers.length) {
        for (const specifier of node.specifiers) {
            if (isExportSpecifier(specifier) && isIdentifier(specifier.exported)) {
                applyExposingToNode(code, node, specifier.exported.name, node.source ? null : specifier.local.name)
                continue
            }

            if (isExportNamespaceSpecifier(specifier)) {
                applyExposingToNode(code, node, specifier.exported.name)
            }
        }

        if (node.source) {
            let exportDeclaration = ';' + code.slice(node.loc.start.index, node.loc.end.index) + ';'
            code.prependRight(node.loc.end.index, exportDeclaration.replace('export', 'import'))
        }

        return;
    }
}

function handleExportDefaultDeclaration(node: ExportDefaultDeclaration, code: MagicString) {
    if (!node.declaration || !node.declaration.loc || !node.loc) {
        return
    }

    const value = code.slice(node.declaration.loc.start.index, node.declaration.loc.end.index)
    const name = getVarName();
    code.overwriteNode(node, `;const ${name} = ${value};export default ${name};`)
    applyExposingToNode(code, node, 'default', name)
}

function handleExportAllDeclaration(node: ExportAllDeclaration, code: MagicString) {
    if (!node.loc) {
        return
    }
    const name = getVarName();
    code.appendRight(
        node.loc.end.index,
        `;import * as ${name} from '${node.source.value}';` +
        'Object.keys(' + name + ').forEach(k => ' + getExposeInMainWorldCall(`'+k+'`, name + '[k]') + ');'
    )
}

function applyExposingToNode(code: MagicString, node: Node, name: string, localName: string | null = null) {
    if (!node.loc) {
        return code
    }

    code.appendRight(node.loc.end.index, ';' + getExposeInMainWorldCall(name, localName) + ';')
    return code
}
