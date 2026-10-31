import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const [command, ...args] = process.argv.slice(2);
let file, forwarded;
if (command === 'new') {
  if (!['ttp', 'configuration'].includes(args[0])) throw new Error('Use library:new -- ttp <ID> or configuration <NAME> --from <folder> [--generate-index]');
  file = args[0] === 'ttp' ? 'new-ttp.mjs' : 'new-config.mjs'; forwarded = args;
} else if (command === 'describe') {
  const configuration = args[0] === 'configuration';
  file = configuration ? 'generate-config-article.mjs' : 'generate-ttp-article.mjs';
  forwarded = configuration || args[0] === 'ttp' ? args.slice(1) : args;
} else throw new Error('Unknown library command');
const result = spawnSync(process.execPath, [fileURLToPath(new URL(file, import.meta.url)), ...forwarded], {stdio: 'inherit'});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
