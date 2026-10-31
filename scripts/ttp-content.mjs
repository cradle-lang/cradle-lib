import {lstat, readFile, readdir, realpath} from 'node:fs/promises';
import path from 'node:path';
import {parseDocument, stringify} from 'yaml';
import {fromMarkdown} from 'mdast-util-from-markdown';

export const repository = 'cradle-lang/cradle-lib';
export const ttpPattern = /^T\d{4}(?:\.\d{3})?$/;
export const articleId = id => `ttp-${id.toLowerCase().replaceAll('.', '-')}`;
export const inside = (base, file) => {const relative = path.relative(base, file); return !path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`);};
export const optionalStat = file => lstat(file).catch(error => {if (error.code === 'ENOENT') return null; throw error;});
export function frontMatter(text) {
  const match = text.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {metadata: {}, body: text};
  const document = parseDocument(match[1], {uniqueKeys: true});
  if (document.errors.length) throw new Error('Invalid or duplicate YAML metadata');
  const metadata = document.toJS({maxAliasCount: 50});
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new Error('Metadata must be a mapping');
  return {metadata, body: text.replace(/^\uFEFF/, '').slice(match[0].length)};
}
export const markdown = (metadata, body) => `---\n${stringify(metadata)}---\n\n${body.trim()}\n`;
export function normalizeMarkdown(body) {
  const replacements = [];
  function visit(node) {
    if (node.type === 'list' && !node.ordered) {
      for (const item of node.children) {
        const offset = item.position.start.offset;
        if (/^[+*](?=\s)/.test(body.slice(offset))) replacements.push({start: offset, end: offset + 1, text: '-'});
      }
    }
    if (node.type === 'code' && !node.lang) {
      const offset = node.position.start.offset;
      const fence = body.slice(offset).match(/^(`{3,}|~{3,})[ \t]*(?=\r?\n)/);
      if (fence) replacements.push({start: offset, end: offset + fence[0].length, text: fence[1] + 'text'});
    }
    for (const child of node.children || []) visit(child);
  }
  visit(fromMarkdown(body));
  let result = body;
  for (const item of replacements.sort((a, b) => b.start - a.start)) result = result.slice(0, item.start) + item.text + result.slice(item.end);
  return result;
}
export function withUsage(body, id) {
  if (/^##\s+Use in a specification\s*$/im.test(body)) return body;
  return `${body.trim()}\n\n## Use in a specification\n\nAttach this heuristic to an existing compatible instance. Consult the module's manifest and documented backend requirements for its operating system and configuration dependencies. This fragment is not a complete scenario:\n\n\`\`\`cradle\ninstance("host") >\n    heuristic("ttp", "${id}").\n\`\`\`\n`;
}

export async function validateImplementation(directory, id) {
  if (!ttpPattern.test(id)) throw new Error('Use a TTP ID such as T1053.003');
  if (!(await lstat(directory)).isDirectory()) throw new Error(`${id}: module must be a regular directory`);
  async function tree(folder) {
    for (const entry of await readdir(folder, {withFileTypes: true})) {
      if (entry.name.startsWith('.') || ['node_modules', '__pycache__'].includes(entry.name)) continue;
      if (entry.isSymbolicLink() || (!entry.isDirectory() && !entry.isFile())) throw new Error(`${id}: symbolic links and special files are not supported`);
      if (entry.isDirectory()) await tree(path.join(folder, entry.name));
    }
  }
  await tree(directory);
  const manifestFile = path.join(directory, 'manifest.json');
  if (!(await lstat(manifestFile)).isFile()) throw new Error(`${id}: manifest.json must be a regular file`);
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  if (manifest.framework !== 'ttp' || manifest.value !== id) throw new Error(`${id}: manifest framework/value must match its folder`);
  if (!Array.isArray(manifest.configs) || !manifest.configs.every(value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(value))) throw new Error(`${id}: invalid manifest configs`);
  const hasOs = manifest.os != null, hasVersion = manifest.os_version != null;
  if (hasOs !== hasVersion || (hasOs && (![manifest.os, manifest.os_version].every(value => typeof value === 'string' && value.trim())))) throw new Error(`${id}: os and os_version must be paired strings or null`);
  const template = path.join(directory, 'ansible', `${id}.j2`);
  if (!(await lstat(template)).isFile() || !(await readFile(template, 'utf8')).trim()) throw new Error(`${id}: missing/nonempty ansible/${id}.j2 required`);
  return manifest;
}

// Traverse Markdown nodes so links inside code examples remain untouched.
export async function mapArticleLinks(body, directory, map) {
  const tree = fromMarkdown(body), replacements = [];
  const root = await realpath(directory);
  async function target(url) {
    if (/^(https?:|mailto:|#)/i.test(url)) return null;
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || /^[\\/]/.test(url)) throw new Error(`Unsupported article link: ${url}`);
    const [, pathname, suffix = ''] = url.match(/^([^?#]*)([?#].*)?$/);
    let decoded;
    try {decoded = decodeURIComponent(pathname);} catch {throw new Error(`Invalid article link encoding: ${url}`);}
    if (/[\\\0]/.test(decoded)) throw new Error(`Unsafe article link: ${url}`);
    const filename = path.resolve(directory, decoded);
    if (!inside(directory, filename)) throw new Error(`Article link escapes module: ${url}`);
    const info = await optionalStat(filename);
    if (!info || info.isSymbolicLink() || !inside(root, await realpath(filename))) throw new Error(`Missing/unsafe article attachment: ${url}`);
    return map ? map(path.relative(directory, filename).split(path.sep).join('/'), info.isDirectory(), suffix) : null;
  }
  async function visit(node) {
    if (['link', 'image', 'definition'].includes(node.type)) {
      const url = await target(node.url);
      if (url) {
        const escaped = (text) => text.replace(/[\\\[\]]/g, '\\$&');
        if (node.type === 'definition') replacements.push({start: node.position.start.offset, end: node.position.end.offset, text: `[${node.label || node.identifier}]: <${url}>`});
        else {
          const label = node.type === 'image' ? `${node.alt || 'Image'} (source image)` : node.children.map(child => child.value || '').join('') || 'Source file';
          replacements.push({start: node.position.start.offset, end: node.position.end.offset, text: `[${escaped(label)}](<${url}>)`});
        }
      }
    } else if (node.type === 'html' && /(?:src|href)\s*=\s*["'](?!https?:|mailto:|#)/i.test(node.value)) throw new Error('Use Markdown links for local attachments');
    else if (node.type === 'imageReference' && map) throw new Error('Use inline Markdown images rather than reference-style images for website export');
    for (const child of node.children || []) await visit(child);
  }
  await visit(tree);
  let result = body;
  for (const item of replacements.sort((a, b) => b.start - a.start)) result = result.slice(0, item.start) + item.text + result.slice(item.end);
  return result;
}

export async function readModule(root, id) {
  const directory = path.join(root, 'heuristics', 'ttp', id);
  const manifest = await validateImplementation(directory, id);
  if (await optionalStat(path.join(directory, 'index.mdx'))) throw new Error(`${id}: use index.md, not index.mdx`);
  const articleName = await optionalStat(path.join(directory, 'index.md')) ? 'index.md' : 'README.md';
  if (!(await lstat(path.join(directory, articleName))).isFile()) throw new Error(`${id}: article must be a regular file`);
  const text = await readFile(path.join(directory, articleName), 'utf8');
  const {metadata, body} = frontMatter(text);
  if (!body.trim()) throw new Error(`${id}: empty article`);
  const title = metadata.title ?? body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? id;
  const description = metadata.description ?? body.split(/\r?\n\s*\r?\n/).find(paragraph => paragraph.trim() && !/^\s*(#|[-*]|```|\[|<)/.test(paragraph))?.replace(/\s+/g, ' ').trim();
  if (![title, description].every(value => typeof value === 'string' && value.trim())) throw new Error(`${id}: add title and description to article metadata`);
  if ((metadata.framework !== undefined && metadata.framework !== 'ttp') || (metadata.identifier !== undefined && metadata.identifier !== id)) throw new Error(`${id}: article identity does not match module`);
  if (metadata.draft !== undefined && typeof metadata.draft !== 'boolean') throw new Error(`${id}: draft must be boolean`);
  await mapArticleLinks(body, directory);
  return {directory, id, manifest, body, metadata: {title, description, framework: 'ttp', identifier: id, draft: metadata.draft ?? false}};
}

export async function exportTtps(root, revision) {
  if (!/^[a-f0-9]{40}$/.test(revision || '')) throw new Error('Export requires a full source commit SHA');
  const entries = [];
  for (const entry of (await readdir(path.join(root, 'heuristics', 'ttp'), {withFileTypes: true})).sort((a,b) => a.name.localeCompare(b.name))) {
    if (entry.name === 'README.md') continue;
    if (!entry.isDirectory() || !ttpPattern.test(entry.name)) throw new Error(`Invalid TTP folder: ${entry.name}`);
    const module = await readModule(root, entry.name);
    const sourceUrl = `https://github.com/${repository}/tree/${revision}/heuristics/ttp/${module.id}`;
    const body = await mapArticleLinks(module.body, module.directory, (relative, isDirectory, suffix) => `https://github.com/${repository}/${isDirectory ? 'tree' : 'blob'}/${revision}/heuristics/ttp/${module.id}${relative ? '/' + relative.split('/').map(encodeURIComponent).join('/') : ''}${suffix}`);
    const article = markdown({...module.metadata, sourceUrl}, normalizeMarkdown(withUsage(body, module.id)));
    if (Buffer.byteLength(article) > 1024 * 1024) throw new Error(`${module.id}: website article exceeds 1 MiB`);
    entries.push({id: articleId(module.id), module: module.id, sourceUrl, article});
  }
  const bundle = {schemaVersion: 1, sourceRepository: repository, sourceRevision: revision, entries};
  if (entries.length > 2000 || Buffer.byteLength(JSON.stringify(bundle)) > 20 * 1024 * 1024) throw new Error('Website bundle exceeds 2000 entries or 20 MiB');
  return bundle;
}
