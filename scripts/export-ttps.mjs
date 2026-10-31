import {mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {exportTtps} from './ttp-content.mjs';
import {checkWebsiteMarkdown} from './website-markdown.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
try {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some(arg => arg !== '--check')) throw new Error('Use library:export-website or library:check');
  const revision = process.env.SOURCE_REVISION || execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
  const bundle = await exportTtps(root, revision);
  await checkWebsiteMarkdown(bundle);
  if (!args.includes('--check')) {
    await mkdir(new URL('../website-export/', import.meta.url), {recursive: true});
    await writeFile(new URL('../website-export/bundle.json', import.meta.url), JSON.stringify(bundle, null, 2) + '\n');
  }
  console.log(`Checked ${bundle.entries.length} TTP modules and article links. No templates or runtime assets were executed.`);
} catch (error) {console.error(error.message); process.exitCode = 1;}
