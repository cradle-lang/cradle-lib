import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, rm, symlink} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import test from 'node:test';
import {exportTtps, frontMatter, mapArticleLinks, normalizeMarkdown} from './ttp-content.mjs';
import {checkWebsiteMarkdown} from './website-markdown.mjs';
import {importTtp} from './new-ttp.mjs';
import {collectContext, generateTtpArticle} from './generate-ttp-article.mjs';
const id = 'T1105', revision = 'a'.repeat(40);
const env = () => ({SERVER: 'https://llm.example/v1', REMOTE_LLM_MODEL: 'test'});
const response = text => ({ok: true, json: async () => ({choices: [{finish_reason: 'stop', message: {content: text}}]})});
const article = (body = 'Existing module documentation.\n\n[Template](./ansible/T1105.j2)') => `---\ntitle: Example TTP\ndescription: A documented test module.\nframework: ttp\nidentifier: ${id}\ndraft: false\n---\n\n${body}\n`;

test('normalizes source list markers and unlabeled fences without rewriting code contents, then checks website rules', async () => {
  const body = '# Example\n\n+ First item\n* Second item\n\n```\n+ Preserve this literal\n```\n\n```bash\necho example\n```\n';
  const original = {entries: [{module: id, article: article(body)}]};
  await assert.rejects(checkWebsiteMarkdown(original), /MD004|MD040/);
  const normalized = normalizeMarkdown(body);
  assert.match(normalized, /- First item\n- Second item/);
  assert.match(normalized, /```text\n\+ Preserve this literal\n```/);
  assert.match(normalized, /```bash\necho example/);
  assert.equal(normalizeMarkdown(normalized), normalized);
  await checkWebsiteMarkdown({entries: [{module: id, article: article(normalized.trim())}]});
});
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'ttp-author-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  return root;
}
async function moduleAt(root, id = 'T1105') {
  const directory = path.join(root, 'heuristics', 'ttp', id);
  await mkdir(path.join(directory, 'ansible'), {recursive: true});
  await writeFile(path.join(directory, 'manifest.json'), JSON.stringify({framework: 'ttp', value: id, configs: [], os: null, os_version: null}));
  await writeFile(path.join(directory, 'ansible', `${id}.j2`), '- name: Test template\n  debug:\n    msg: example\n');
  await writeFile(path.join(directory, 'README.md'), '# Original TTP\n\nOriginal purpose and attribution.\n\n[Template](./ansible/)\n');
  return directory;
}

test('exports README fallback, authored article precedence, draft flags and commit-pinned links', async t => {
  const root = await fixture(t), directory = await moduleAt(root);
  const initial = await exportTtps(root, revision);
  assert.equal(initial.entries[0].module, id);
  assert.equal(frontMatter(initial.entries[0].article).metadata.draft, false);
  assert.match(initial.entries[0].article, /## Use in a specification/);
  assert.ok(initial.entries[0].article.includes(`heuristic("ttp", "${id}")`));
  assert.match(initial.entries[0].article, new RegExp(`tree/${revision}/heuristics/ttp/${id}/ansible`));
  await writeFile(path.join(directory, 'index.md'), article().replace('draft: false', 'draft: true'));
  const next = await exportTtps(root, revision);
  assert.equal(frontMatter(next.entries[0].article).metadata.title, 'Example TTP');
  assert.equal(frontMatter(next.entries[0].article).metadata.draft, true);
  assert.match(next.entries[0].article, new RegExp(`blob/${revision}/heuristics/ttp/${id}/ansible/${id}.j2`));
  await writeFile(path.join(directory, 'index.md'), article(`[Template](./ansible/${id}.j2?raw=1#example)`));
  assert.match((await exportTtps(root, revision)).entries[0].article, /\?raw=1#example/);
});

test('rejects invalid identity, duplicate YAML, broken links and encoded traversal; ignores code examples', async t => {
  const root = await fixture(t), directory = await moduleAt(root);
  for (const body of ['[Missing](./absent.txt)', '[Escape](../outside.txt)', '[Encoded](%2e%2e/outside.txt)', '[Drive](C:/secret.txt)', '[Local](/etc/passwd)']) {
    await writeFile(path.join(directory, 'index.md'), article(body));
    await assert.rejects(exportTtps(root, revision));
  }
  await writeFile(path.join(directory, 'index.md'), article('```md\n[Example](./not-a-real-file)\n```'));
  await exportTtps(root, revision);
  await writeFile(path.join(directory, 'index.md'), article().replace('draft: false', 'draft: false\ndraft: true'));
  await assert.rejects(exportTtps(root, revision), /YAML/);
  await writeFile(path.join(directory, 'index.md'), article().replace(id, 'T9999'));
  await assert.rejects(exportTtps(root, revision), /identity/);
});

test('imports source byte-for-byte, adapts the supplied template, preserves articles and refuses overwrite', async t => {
  const sourceRoot = await fixture(t), source = await moduleAt(sourceRoot), destinationRoot = await fixture(t);
  await writeFile(path.join(source, 'payload.bin'), Buffer.from([0, 255, 1]));
  await writeFile(path.join(source, '.env'), 'SECRET=not-for-import');
  const destination = await importTtp(id, {sourceRoot: destinationRoot, from: source});
  assert.deepEqual(await readFile(path.join(destination, 'payload.bin')), Buffer.from([0, 255, 1]));
  assert.equal((await readFile(path.join(destination, 'README.md'), 'utf8')), await readFile(path.join(source, 'README.md'), 'utf8'));
  await assert.rejects(readFile(path.join(destination, '.env')), {code: 'ENOENT'});
  const starter = frontMatter(await readFile(path.join(destination, 'index.md'), 'utf8'));
  assert.equal(starter.metadata.framework, 'ttp'); assert.equal(starter.metadata.identifier, id); assert.equal(starter.metadata.draft, true);
  assert.match(starter.body, /Mapping and implementation/);
  await assert.rejects(importTtp(id, {sourceRoot: destinationRoot, from: source}), /already exists/);
  const anotherRoot = await fixture(t);
  await writeFile(path.join(source, 'index.md'), article());
  await importTtp(id, {sourceRoot: anotherRoot, from: source, generateIndex: true, fetchImpl: () => {throw new Error('must not call LLM');}});
  assert.equal(await readFile(path.join(anotherRoot, 'heuristics', 'ttp', id, 'index.md'), 'utf8'), article());
});

test('generation uses README and heuristic template, forces drafts, corrects links once and preserves original files', async t => {
  const root = await fixture(t), directory = await moduleAt(root);
  let calls = 0;
  const result = await generateTtpArticle(id, {sourceRoot: root, env: env(), fetchImpl: async (url, request) => {
    const messages = JSON.parse(request.body).messages;
    assert.match(messages[0].content, /Mapping and implementation/);
    assert.match(messages[1].content, /Original purpose and attribution/);
    calls++;
    return response(calls === 1 ? article('[Bad](./missing.txt)') : article());
  }});
  assert.equal(calls, 2); assert.equal(result.omitted, 0);
  const saved = await readFile(path.join(directory, 'index.md'), 'utf8');
  assert.equal(frontMatter(saved).metadata.draft, true);
  assert.match(saved, /AI-generated draft/);
  assert.match(await readFile(path.join(directory, 'README.md'), 'utf8'), /Original purpose/);
  await assert.rejects(generateTtpArticle(id, {sourceRoot: root, env: env()}), /--force/);
  await assert.rejects(generateTtpArticle(id, {sourceRoot: root, overwrite: true, env: env(), fetchImpl: async () => ({ok: false, status: 503})}), /HTTP 503/);
  assert.equal(await readFile(path.join(directory, 'index.md'), 'utf8'), saved);
  await assert.rejects(generateTtpArticle(id, {sourceRoot: root, overwrite: true, env: env(), fetchImpl: async () => {await writeFile(path.join(directory, 'index.md'), 'Concurrent author edit'); return response(article());}}), /changed during generation/);
  assert.equal(await readFile(path.join(directory, 'index.md'), 'utf8'), 'Concurrent author edit');
});

test('failed import generation keeps copied files and draft; successful import generation writes index.md', async t => {
  const source = await moduleAt(await fixture(t)), root = await fixture(t);
  await assert.rejects(importTtp(id, {sourceRoot: root, from: source, generateIndex: true, env: env(), fetchImpl: async () => ({ok: false, status: 500})}), /Files and starter article preserved/);
  assert.match(await readFile(path.join(root, 'heuristics', 'ttp', id, 'index.md'), 'utf8'), /draft: true/);
  assert.ok(await readFile(path.join(root, 'heuristics', 'ttp', id, 'manifest.json')));
  const good = await fixture(t);
  await importTtp(id, {sourceRoot: good, from: source, generateIndex: true, env: env(), fetchImpl: async () => response(article())});
  assert.match(await readFile(path.join(good, 'heuristics', 'ttp', id, 'index.md'), 'utf8'), /AI-generated draft/);
});

test('context excludes secrets, TOML and binary contents and reports bounded omissions', async t => {
  const directory = await moduleAt(await fixture(t));
  await writeFile(path.join(directory, '.env'), 'HIDDEN_SECRET');
  await writeFile(path.join(directory, 'settings.toml'), 'TOML_SECRET');
  await writeFile(path.join(directory, 'binary.txt'), Buffer.from([0, 1, 2]));
  await writeFile(path.join(directory, 'large.txt'), 'x'.repeat(40000));
  const context = await collectContext(directory, 5000);
  assert.ok(!JSON.stringify(context).includes('HIDDEN_SECRET'));
  assert.ok(!JSON.stringify(context).includes('TOML_SECRET'));
  assert.ok(context.omitted.includes('binary.txt'));
  assert.ok(context.contents.some(item => item.truncated));
  assert.ok(JSON.stringify(context).length < 5000);
});

test('rejects directory symlinks/junctions in source modules before copying', async t => {
  const directory = await moduleAt(await fixture(t)), outside = await fixture(t);
  await symlink(outside, path.join(directory, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(importTtp(id, {sourceRoot: await fixture(t), from: directory}), /symbolic links/);
  await assert.rejects(mapArticleLinks('[Escape](./linked/)', directory), /unsafe/);
});

test('sub-technique IDs keep their source folder and map to existing hyphenated website routes', async t => {
  const root = await fixture(t), technique = 'T1053.003';
  await moduleAt(root, technique);
  const bundle = await exportTtps(root, revision);
  assert.equal(bundle.entries[0].id, 'ttp-t1053-003');
  assert.equal(bundle.entries[0].module, technique);
  assert.equal(bundle.entries[0].sourceUrl, `https://github.com/cradle-lang/cradle-lib/tree/${revision}/heuristics/ttp/${technique}`);
  const target = await fixture(t);
  await importTtp(technique, {sourceRoot: target, from: path.join(root, 'heuristics/ttp', technique)});
  await exportTtps(target, revision);
  for (const bad of ['T110', 't1105', 'T1105.01', '../T1105', 'CVE-2026-12345']) {
    await assert.rejects(importTtp(bad, {sourceRoot: target, from: root}));
  }
});

test('configuration checks reject missing/empty dependencies and accept repository configs and routing builtins', async t => {
  const {checkConfigs} = await import('./check-configs.mjs');
  const root = await fixture(t), directory = await moduleAt(root);
  const file = path.join(directory, 'manifest.json');
  const manifest = JSON.parse(await readFile(file, 'utf8'));
  await writeFile(file, JSON.stringify({...manifest, configs: ['example', 'linux-routing', 'win-routing']}));
  await assert.rejects(checkConfigs(root));
  await mkdir(path.join(root, 'configs/example/ansible'), {recursive: true});
  const template = path.join(root, 'configs/example/ansible/example.j2');
  await writeFile(template, '');
  await assert.rejects(checkConfigs(root));
  await writeFile(template, '- name: Example\n  debug: {}\n');
  await checkConfigs(root);
});

test('rejects unsafe destination parents before copying into an external directory', async t => {
  const root = await fixture(t), outside = await fixture(t), source = await moduleAt(await fixture(t));
  await symlink(outside, path.join(root, 'heuristics'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(importTtp(id, {sourceRoot: root, from: source}), /Unsafe/);
  await assert.rejects(readFile(path.join(outside, 'ttp', id, 'manifest.json')), {code: 'ENOENT'});
});

test('source workflows validate all modules without credentials before exporting and dispatch only successful main runs', async () => {
  const {parse} = await import('yaml');
  const validate = parse(await readFile(new URL('../.github/workflows/validate-ttps.yml', import.meta.url), 'utf8'));
  const steps = validate.jobs.validate.steps;
  assert.ok(steps.findIndex(step => step.run === 'npm run check') < steps.findIndex(step => step.uses?.startsWith('actions/upload-artifact')));
  assert.equal(steps.find(step => step.uses?.startsWith('actions/upload-artifact')).with.name, 'website-ttps');
  assert.doesNotMatch(JSON.stringify(validate), /secrets\.|pull_request_target/);
  const notify = parse(await readFile(new URL('../.github/workflows/notify-website.yml', import.meta.url), 'utf8'));
  assert.deepEqual(notify.on.workflow_run.workflows, ['Validate TTP library']);
  assert.match(notify.jobs.notify.if, /push.*workflow_dispatch/);
  assert.match(notify.jobs.notify.if, /head_repository.full_name == github.repository/);
  assert.match(JSON.stringify(notify), /ttp-library-updated/);
});
