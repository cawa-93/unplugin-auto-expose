import { readFile } from 'fs/promises';
import { findExports } from 'mlly';
import type { ExportInfo } from './types';

/**
 * @see https://github.com/unjs/unimport/blob/c46860a638377b3329625b70c64e4f62afe4dcc7/src/scan-dirs.ts#L35-L61 Reference
 */
export async function scanExports(filepath: string) {
  const imports: ExportInfo[] = [];
  const code = await readFile(filepath, 'utf-8');
  const exports = findExports(code);
  const defaultExport = exports.find((i) => i.type === 'default');
  if (defaultExport) {
    imports.push({ name: 'default', as: 'default', from: filepath });
  }
  for (const exp of exports) {
    if (exp.type === 'named') {
      for (const name of exp.names) {
        imports.push({ name, as: name, from: filepath });
      }
    } else if (exp.type === 'declaration') {
      if (exp.name) {
        imports.push({ name: exp.name, as: exp.name, from: filepath });
      }
    } else if (exp.type === 'star') {
      if (!exp.name) {
        continue;
      }
      imports.push({ name: exp.name, as: exp.name, from: filepath });
    }
  }
  return imports;
}
