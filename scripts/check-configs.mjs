import {lstat, readFile, readdir, realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ttpPattern, validateImplementation, inside} from './ttp-content.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
export async function checkConfigs(sourceRoot = root) {
  const library = await realpath(sourceRoot);
  const builtins = new Set(['linux-routing', 'win-routing']);
  for (const entry of await readdir(path.join(library, 'heuristics', 'ttp'), {withFileTypes: true})) {
    if (!ttpPattern.test(entry.name)) continue;
    const manifest = await validateImplementation(path.join(library, 'heuristics', 'ttp', entry.name), entry.name);
    for (const name of manifest.configs) {
      if (builtins.has(name)) continue;
      const filename = path.join(library, 'configs', name, 'ansible', `${name}.j2`);
      if (!inside(library, await realpath(filename)) || !(await lstat(filename)).isFile() || !(await readFile(filename, 'utf8')).trim()) throw new Error(`${entry.name}: missing/unsafe implied config ${name}`);
    }
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {await checkConfigs(); console.log('All manifest-implied configuration templates exist. Templates were not rendered or executed.');}
  catch (error) {console.error(error.message); process.exitCode = 1;}
}
