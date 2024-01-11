import {parse} from '@babel/parser'

export function getAST(code: string, sourceFilename: string) {
    return parse(code, {
        sourceType: 'module',
        attachComment: false,
        createImportExpressions: true,
        sourceFilename,
        plugins: [
            'typescript',
            'topLevelAwait',
        ]
    })
}
