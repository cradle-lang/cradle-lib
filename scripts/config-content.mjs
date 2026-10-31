import {lstat, readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {repository, frontMatter, markdown, normalizeMarkdown, mapArticleLinks, optionalStat} from './ttp-content.mjs';
export {frontMatter, markdown, normalizeMarkdown, mapArticleLinks, optionalStat, inside} from './ttp-content.mjs';
export const configPattern = /^[A-Za-z0-9]+(?:[-_.][A-Za-z0-9]+)*$/;
export const articleId = id => id.toLowerCase().replace(/[_.]/g, '-');
export const operatingSystems = ['Linux', 'Windows', 'Cross-platform', 'Unspecified'];
export function withUsage(body, id) {
  if (/^##\s+Use in a specification\s*$/im.test(body)) return body;
  return `${body.trim()}\n\n## Use in a specification\n\nAttach this configuration to an existing compatible instance whose operating system and network are defined by the scenario. This fragment is not a complete scenario:\n\n\`\`\`cradle\ninstance("host") >\n    config("${id}").\n\`\`\`\n`;
}
export async function validateImplementation(directory, id) {
  if (!configPattern.test(id || '')) throw new Error('Use a configuration name such as linux-my-service');
  if (!(await lstat(directory)).isDirectory()) throw new Error(`${id}: module must be a regular directory`);
  async function tree(folder) {
    for (const entry of await readdir(folder, {withFileTypes: true})) {
      if (entry.name.startsWith('.') || ['node_modules', '__pycache__'].includes(entry.name)) continue;
      if (entry.isSymbolicLink() || (!entry.isDirectory() && !entry.isFile())) throw new Error(`${id}: symbolic links and special files are not supported`);
      if (entry.isDirectory()) await tree(path.join(folder, entry.name));
    }
  }
  await tree(directory);
  const template = path.join(directory, 'ansible', `${id}.j2`);
  if (!(await lstat(template)).isFile() || !(await readFile(template, 'utf8')).trim()) throw new Error(`${id}: nonempty ansible/${id}.j2 required`);
}
export function configMetadata(metadata, id, body) {
  if (metadata.config !== undefined && metadata.config !== id) throw new Error(`${id}: article config must match its source folder exactly`);
  if (['framework', 'identifier', 'id', 'slug', 'deployment'].some(key => metadata[key] !== undefined)) throw new Error(`${id}: unsupported configuration identity metadata`);
  if (metadata.draft !== undefined && typeof metadata.draft !== 'boolean') throw new Error(`${id}: draft must be boolean`);
  const title = metadata.title ?? body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? id;
  const description = metadata.description ?? body.split(/\r?\n\s*\r?\n/).find(p => p.trim() && !/^\s*(#|[-*]|```|\[|<)/.test(p))?.replace(/\s+/g, ' ').trim();
  if (![title, description].every(value => typeof value === 'string' && value.trim())) throw new Error(`${id}: add title and description to article metadata`);
  const os = metadata.os ?? 'Unspecified', category = metadata.category ?? 'Other';
  if (!operatingSystems.includes(os) || typeof category !== 'string' || !category.trim()) throw new Error(`${id}: invalid OS or category metadata`);
  return {title, description, config: id, os, category, draft: metadata.draft ?? false};
}
export async function readModule(root, id) {
  const directory = path.join(root, 'configs', id);
  await validateImplementation(directory, id);
  if (await optionalStat(path.join(directory, 'index.mdx'))) throw new Error(`${id}: use index.md, not index.mdx`);
  const articleName = await optionalStat(path.join(directory, 'index.md')) ? 'index.md' : 'README.md';
  if (!(await lstat(path.join(directory, articleName))).isFile()) throw new Error(`${id}: add an index.md article or README.md`);
  const {metadata, body} = frontMatter(await readFile(path.join(directory, articleName), 'utf8'));
  if (!body.trim()) throw new Error(`${id}: empty article`);
  await mapArticleLinks(body, directory);
  return {directory, id, body, metadata: configMetadata(metadata, id, body)};
}
export async function exportConfigs(root, revision) {
  if (!/^[a-f0-9]{40}$/.test(revision || '')) throw new Error('Export requires a full source commit SHA');
  const entries = [], seen = new Set();
  for (const entry of (await readdir(path.join(root, 'configs'), {withFileTypes: true})).sort((a,b) => a.name.localeCompare(b.name))) {
    if (entry.name === 'README.md') continue;
    if (!entry.isDirectory() || !configPattern.test(entry.name)) throw new Error(`Invalid configuration folder: ${entry.name}`);
    const module = await readModule(root, entry.name), id = articleId(module.id);
    if (seen.has(id)) throw new Error(`Duplicate configuration website ID: ${id}`);
    seen.add(id);
    const sourceUrl = `https://github.com/${repository}/tree/${revision}/configs/${module.id}`;
    const body = await mapArticleLinks(module.body, module.directory, (relative, isDirectory, suffix) => `https://github.com/${repository}/${isDirectory ? 'tree' : 'blob'}/${revision}/configs/${module.id}${relative ? '/' + relative.split('/').map(encodeURIComponent).join('/') : ''}${suffix}`);
    const article = markdown({...module.metadata, sourceUrl}, normalizeMarkdown(withUsage(body, module.id)));
    if (Buffer.byteLength(article) > 1024 * 1024) throw new Error(`${module.id}: website article exceeds 1 MiB`);
    entries.push({id, module: module.id, sourceUrl, article});
  }
  const bundle = {schemaVersion: 1, sourceRepository: repository, sourceRevision: revision, entries};
  if (entries.length > 2000 || Buffer.byteLength(JSON.stringify(bundle)) > 20 * 1024 * 1024) throw new Error('Website bundle exceeds 2000 entries or 20 MiB');
  return bundle;
}
