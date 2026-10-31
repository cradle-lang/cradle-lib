import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {parse} from 'yaml';
import {checkDocs, checkMarkdown} from './check-docs.mjs';

test('reports website Markdown quality rules with file and line, while keeping website rule exceptions', async () => {
  await assert.rejects(checkMarkdown({'index.md': '# Example\n\n```\ntext\n```\n'}), /index.md:3 MD040/);
  await checkMarkdown({'index.md': '# Example\n\n' + 'x'.repeat(300) + '\n\n# Second heading\n'});
});

test('checks tracked and newly authored Markdown/MDX with spaces, excluding ignored files and CI checkouts', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'docs quality '));
  t.after(() => rm(root, {recursive: true, force: true}));
  execFileSync('git', ['init', '--quiet'], {cwd: root});
  await writeFile(path.join(root, '.gitignore'), 'node_modules/\nwebsite-export/\n');
  await writeFile(path.join(root, 'README.md'), '# Example\n');
  execFileSync('git', ['add', '.'], {cwd: root});
  await mkdir(path.join(root, 'docs'), {recursive: true});
  await writeFile(path.join(root, 'docs/new article.mdx'), '# New article\n\n<div>Content</div>\n');
  for (const directory of ['node_modules', 'website-export', '.ci/library']) {
    await mkdir(path.join(root, directory), {recursive: true});
    await writeFile(path.join(root, directory, 'bad.md'), '# Ignored\n\n```\ninvalid\n```\n');
  }
  assert.equal(await checkDocs(root), 2);
  await writeFile(path.join(root, 'docs/new article.mdx'), '# New article\n\n```\ninvalid\n```\n');
  await assert.rejects(checkDocs(root), /docs\/new article.mdx:3 MD040/);
  await writeFile(path.join(root, 'docs/new article.mdx'), '# Fixed\n');
  await writeFile(path.join(root, 'README.md'), '# Tracked\n\n```\ninvalid\n```\n');
  await assert.rejects(checkDocs(root), /README.md:3 MD040/);
});

test('Docs Quality is visible on PR/main/manual runs and blocks normal validation through npm run check', async () => {
  const workflow = parse(await readFile(new URL('../.github/workflows/docs-quality.yml', import.meta.url), 'utf8'));
  assert.ok(Object.hasOwn(workflow.on, 'pull_request'));
  assert.deepEqual(workflow.on.push.branches, ['main']);
  assert.ok(Object.hasOwn(workflow.on, 'workflow_dispatch'));
  assert.deepEqual(workflow.permissions, {contents: 'read'});
  assert.ok(workflow.jobs.markdownlint.steps.some(step => step.run === 'npm run docs:check'));
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(pkg.scripts.check.startsWith('npm run docs:check && '));
});
