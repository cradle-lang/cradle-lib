import {collectContext} from './generate-ttp-article.mjs';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, rm, symlink} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import test from 'node:test';
import {exportConfigs, frontMatter, mapArticleLinks, normalizeMarkdown} from './config-content.mjs';
import {checkWebsiteMarkdown} from './website-markdown.mjs';
import {importConfig} from './new-config.mjs';
import {generateConfigArticle} from './generate-config-article.mjs';
const id = 'linux-example', revision = 'a'.repeat(40);
const env = () => ({SERVER: 'https://llm.example/v1', REMOTE_LLM_MODEL: 'test'});
const response = text => ({ok: true, json: async () => ({choices: [{finish_reason: 'stop', message: {content: text}}]})});
const article = (body = 'Existing module documentation.\n\n[Template](./ansible/linux-example.j2)') => `---\ntitle: Example configuration\ndescription: A documented test module.\nconfig: ${id}\nos: Linux\ncategory: Networking\ndraft: false\n---\n\n${body}\n`;

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
  const root = await mkdtemp(path.join(tmpdir(), 'config-author-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  return root;
}
async function moduleAt(root, id = 'linux-example') {
  const directory = path.join(root, 'configs', id);
  await mkdir(path.join(directory, 'ansible'), {recursive: true});
  await writeFile(path.join(directory, 'ansible', `${id}.j2`), '- name: Test template\n  debug:\n    msg: example\n');
  await writeFile(path.join(directory, 'README.md'), '# Original configuration\n\nOriginal purpose and attribution.\n\n[Template](./ansible/)\n');
  return directory;
}

test('exports README fallback, authored article precedence, draft flags and commit-pinned links', async t => {
  const root = await fixture(t), directory = await moduleAt(root);
  const initial = await exportConfigs(root, revision);
  assert.equal(initial.entries[0].module, id);
  assert.equal(frontMatter(initial.entries[0].article).metadata.draft, false);
  assert.match(initial.entries[0].article, /## Use in a specification/);
  assert.ok(initial.entries[0].article.includes(`config("${id}")`));
  assert.match(initial.entries[0].article, new RegExp(`tree/${revision}/configs/${id}/ansible`));
  await writeFile(path.join(directory, 'index.md'), article().replace('draft: false', 'draft: true'));
  const next = await exportConfigs(root, revision);
  assert.equal(frontMatter(next.entries[0].article).metadata.title, 'Example configuration');
  assert.equal(frontMatter(next.entries[0].article).metadata.draft, true);
  assert.match(next.entries[0].article, new RegExp(`blob/${revision}/configs/${id}/ansible/${id}.j2`));
  await writeFile(path.join(directory, 'index.md'), article(`[Template](./ansible/${id}.j2?raw=1#example)`));
  assert.match((await exportConfigs(root, revision)).entries[0].article, /\?raw=1#example/);
});

test('rejects invalid identity, duplicate YAML, broken links and encoded traversal; ignores code examples', async t => {
  const root = await fixture(t), directory = await moduleAt(root);
  for (const body of ['[Missing](./absent.txt)', '[Escape](../outside.txt)', '[Encoded](%2e%2e/outside.txt)', '[Drive](C:/secret.txt)', '[Local](/etc/passwd)']) {
    await writeFile(path.join(directory, 'index.md'), article(body));
    await assert.rejects(exportConfigs(root, revision));
  }
  await writeFile(path.join(directory, 'index.md'), article('```md\n[Example](./not-a-real-file)\n```'));
  await exportConfigs(root, revision);
  await writeFile(path.join(directory, 'index.md'), article().replace('draft: false', 'draft: false\ndraft: true'));
  await assert.rejects(exportConfigs(root, revision), /YAML/);
  await writeFile(path.join(directory, 'index.md'), article().replace(id, 'other-config'));
  await assert.rejects(exportConfigs(root, revision), /config must match/);
});

test('imports source byte-for-byte, adapts the supplied template, preserves articles and refuses overwrite', async t => {
  const sourceRoot = await fixture(t), source = await moduleAt(sourceRoot), destinationRoot = await fixture(t);
  await writeFile(path.join(source, 'payload.bin'), Buffer.from([0, 255, 1]));
  await writeFile(path.join(source, '.env'), 'SECRET=not-for-import');
  const destination = await importConfig(id, {sourceRoot: destinationRoot, from: source});
  assert.deepEqual(await readFile(path.join(destination, 'payload.bin')), Buffer.from([0, 255, 1]));
  assert.equal((await readFile(path.join(destination, 'README.md'), 'utf8')), await readFile(path.join(source, 'README.md'), 'utf8'));
  await assert.rejects(readFile(path.join(destination, '.env')), {code: 'ENOENT'});
  const starter = frontMatter(await readFile(path.join(destination, 'index.md'), 'utf8'));
  assert.equal(starter.metadata.os, 'Unspecified'); assert.equal(starter.metadata.config, id); assert.equal(starter.metadata.draft, true);
  assert.match(starter.body, /Implementation/);
  await assert.rejects(importConfig(id, {sourceRoot: destinationRoot, from: source}), /already exists/);
  const anotherRoot = await fixture(t);
  await writeFile(path.join(source, 'index.md'), article());
  await importConfig(id, {sourceRoot: anotherRoot, from: source, generateIndex: true, fetchImpl: () => {throw new Error('must not call LLM');}});
  assert.equal(await readFile(path.join(anotherRoot, 'configs', id, 'index.md'), 'utf8'), article());
});

test('generation uses README and configuration template, forces drafts, corrects links once and preserves original files', async t => {
  const root = await fixture(t), directory = await moduleAt(root);
  let calls = 0;
  const result = await generateConfigArticle(id, {sourceRoot: root, env: env(), fetchImpl: async (url, request) => {
    const messages = JSON.parse(request.body).messages;
    assert.match(messages[0].content, /Implementation/);
    assert.match(messages[1].content, /Original purpose and attribution/);
    calls++;
    return response(calls === 1 ? article('[Bad](./missing.txt)') : article());
  }});
  assert.equal(calls, 2); assert.equal(result.omitted, 0);
  const saved = await readFile(path.join(directory, 'index.md'), 'utf8');
  assert.equal(frontMatter(saved).metadata.draft, true);
  assert.match(saved, /AI-generated draft/);
  assert.match(await readFile(path.join(directory, 'README.md'), 'utf8'), /Original purpose/);
  await assert.rejects(generateConfigArticle(id, {sourceRoot: root, env: env()}), /--force/);
  await assert.rejects(generateConfigArticle(id, {sourceRoot: root, overwrite: true, env: env(), fetchImpl: async () => ({ok: false, status: 503})}), /HTTP 503/);
  assert.equal(await readFile(path.join(directory, 'index.md'), 'utf8'), saved);
  await assert.rejects(generateConfigArticle(id, {sourceRoot: root, overwrite: true, env: env(), fetchImpl: async () => {await writeFile(path.join(directory, 'index.md'), 'Concurrent author edit'); return response(article());}}), /changed during generation/);
  assert.equal(await readFile(path.join(directory, 'index.md'), 'utf8'), 'Concurrent author edit');
});

test('failed import generation keeps copied files and draft; successful import generation writes index.md', async t => {
  const source = await moduleAt(await fixture(t)), root = await fixture(t);
  await assert.rejects(importConfig(id, {sourceRoot: root, from: source, generateIndex: true, env: env(), fetchImpl: async () => ({ok: false, status: 500})}), /Files and starter article preserved/);
  assert.match(await readFile(path.join(root, 'configs', id, 'index.md'), 'utf8'), /draft: true/);
  assert.ok(await readFile(path.join(root, 'configs', id, 'ansible', `${id}.j2`)));
  const good = await fixture(t);
  await importConfig(id, {sourceRoot: good, from: source, generateIndex: true, env: env(), fetchImpl: async () => response(article())});
  assert.match(await readFile(path.join(good, 'configs', id, 'index.md'), 'utf8'), /AI-generated draft/);
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
  await assert.rejects(importConfig(id, {sourceRoot: await fixture(t), from: directory}), /symbolic links/);
  await assert.rejects(mapArticleLinks('[Escape](./linked/)', directory), /unsafe/);
});


test('requires a matching nonempty template without a manifest and validates configuration metadata', async t => {
  const {validateImplementation} = await import('./config-content.mjs');
  const root = await fixture(t), directory = await moduleAt(root);
  await validateImplementation(directory, id);
  await assert.rejects(readFile(path.join(directory, 'manifest.json')), {code: 'ENOENT'});
  const template = path.join(directory, 'ansible', `${id}.j2`);
  const original = await readFile(template);
  await writeFile(template, ''); await assert.rejects(exportConfigs(root, revision));
  await writeFile(template, original);
  for (const text of [article().replace('os: Linux', 'os: Ubuntu'), article().replace('category: Networking', 'category: []'), article().replace('draft: false', 'draft: false\nframework: ttp'), article().replace(`config: ${id}`, 'config: something-else')]) {
    await writeFile(path.join(directory, 'index.md'), text); await assert.rejects(exportConfigs(root, revision));
  }
});

test('preserves mixed-case config names and rejects IDs that collide after route normalization', async t => {
  const root = await fixture(t);
  await moduleAt(root, 'win-tellerApp');
  const value = await exportConfigs(root, revision);
  assert.equal(value.entries[0].id, 'win-tellerapp');
  assert.equal(value.entries[0].module, 'win-tellerApp');
  assert.match(value.entries[0].article, /config: win-tellerApp/);
  await moduleAt(root, 'win_tellerApp');
  await assert.rejects(exportConfigs(root, revision), /Duplicate/);
});

test('rejects unsafe configuration parent directories before copying', async t => {
  const root = await fixture(t), outside = await fixture(t), source = await moduleAt(await fixture(t));
  await symlink(outside, path.join(root, 'configs'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(importConfig(id, {sourceRoot: root, from: source}), /Unsafe/);
  await assert.rejects(readFile(path.join(outside, id, 'index.md')), {code: 'ENOENT'});
});

test('configuration workflows export a separate artifact and notify only successful source-main runs', async () => {
  const {parse} = await import('yaml');
  const workflow = parse(await readFile(new URL('../.github/workflows/validate-configs.yml', import.meta.url), 'utf8'));
  const steps = workflow.jobs.validate.steps;
  const artifact = steps.find(s => s.uses?.startsWith('actions/upload-artifact')).with;
  assert.equal(artifact.name, 'website-configurations');
  assert.equal(artifact.path, 'website-config-export/bundle.json');
  assert.ok(steps.findIndex(s => s.run === 'npm run check') < steps.findIndex(s => s.run === 'npm run library:export-configurations'));
  assert.doesNotMatch(JSON.stringify(workflow), /secrets\.|pull_request_target/);
  const notify = parse(await readFile(new URL('../.github/workflows/notify-config-website.yml', import.meta.url), 'utf8'));
  assert.deepEqual(notify.on.workflow_run.workflows, [workflow.name]);
  assert.match(notify.jobs.notify.if, /push.*workflow_dispatch/);
  assert.match(notify.jobs.notify.if, /head_repository.full_name == github.repository/);
  assert.match(JSON.stringify(notify), /configuration-library-updated/);
});
