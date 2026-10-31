import {cp, mkdir, readFile, readdir, realpath, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {configPattern, inside, optionalStat, validateImplementation} from './config-content.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const excluded = name => name.startsWith('.') || ['node_modules', '__pycache__'].includes(name);

export async function importConfig(id, {sourceRoot = root, from, generateIndex = false, env, fetchImpl} = {}) {
  if (!configPattern.test(id || '') || !from) throw new Error('Use library:new -- configuration linux-my-service --from <module-directory> [--generate-index]');
  const destination = path.join(sourceRoot, 'configs', id);
  if (await optionalStat(destination)) throw new Error('Module already exists; no files changed. Use library:describe with --force to regenerate its article.');
  const source = await realpath(path.resolve(from));
  const resolvedDestination = path.join(await realpath(sourceRoot), 'configs', id);
  if (inside(source, resolvedDestination) || inside(resolvedDestination, source)) throw new Error('Source and destination must not overlap');
  await validateImplementation(source, id);
  if (await optionalStat(path.join(source, 'index.mdx'))) throw new Error('Convert index.mdx to index.md before importing');
  // The destination is reserved before copying; never overwrite an existing module.
  let parent = await realpath(sourceRoot);
  for (const name of ['configs']) {
    parent = path.join(parent, name);
    const info = await optionalStat(parent);
    if (info && (!info.isDirectory() || info.isSymbolicLink())) throw new Error('Unsafe module destination parent');
    if (!info) await mkdir(parent);
  }
  await mkdir(destination);
  try {
    for (const name of await readdir(source)) {
      if (excluded(name)) continue;
      await cp(path.join(source, name), path.join(destination, name), {recursive: true, force: false, errorOnExist: true, filter: filename => !excluded(path.basename(filename))});
    }
    if (!(await optionalStat(path.join(destination, 'index.md')))) {
      const template = await readFile(new URL('../library/_templates/configuration/index.md', import.meta.url), 'utf8');
      const article = template.replace(/^title:.*$/m, `title: ${JSON.stringify(id)}`).replace(/^config:.*$/m, `config: ${JSON.stringify(id)}`).replace(/^os:.*$/m, 'os: Unspecified').replace(/^category:.*$/m, 'category: Other').replaceAll('my-config', id);
      await writeFile(path.join(destination, 'index.md'), article);
      if (generateIndex) {
        // Generation failures keep the copied implementation and starter article.
        try {
          const {generateConfigArticle} = await import('./generate-config-article.mjs');
          await generateConfigArticle(id, {sourceRoot, overwrite: true, env, fetchImpl});
        } catch (error) {throw Object.assign(new Error(`Copied ${id}, but article generation failed: ${error.message} Files and starter article preserved. Retry library:describe -- configuration ${id} --force`), {preserveModule: true});}
      }
    }
    // Authored index.md is intentionally preserved, even with --generate-index.
  } catch (error) {
    if (!error.preserveModule) await rm(destination, {recursive: true, force: true});
    throw error;
  }
  return destination;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [kind, id, ...flags] = process.argv.slice(2), options = {};
    if (kind !== 'configuration') throw new Error('Use library:new -- configuration <CONFIG-NAME> --from <directory> [--generate-index]');
    for (let i = 0; i < flags.length; i++) {
      if (flags[i] === '--from' && options.from === undefined && flags[i + 1] && !flags[i + 1].startsWith('--')) options.from = flags[++i];
      else if (flags[i] === '--generate-index' && !options.generateIndex) options.generateIndex = true;
      else throw new Error(`Unknown, duplicate or incomplete flag: ${flags[i]}`);
    }
    console.log(`Imported ${await importConfig(id, options)}. Review documentation and draft status before publication.`);
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
