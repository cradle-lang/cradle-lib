import {execFileSync} from 'node:child_process';
import {lstat, readFile, realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {lint} from 'markdownlint/promise';
const root = fileURLToPath(new URL('../', import.meta.url));
// Same rule snapshot as cradle-lang.github.io/.markdownlint.json.
const config = JSON.parse(await readFile(new URL('../.markdownlint.json', import.meta.url), 'utf8'));
const excluded = ['.ci', 'node_modules', 'build', 'dist', 'website-export', 'website-config-export', 'scenario-output'];
export async function checkMarkdown(strings) {
  const result = await lint({strings, config});
  const errors = Object.entries(result).flatMap(([name, issues]) => issues.map(issue => `${name}:${issue.lineNumber} ${issue.ruleNames[0]} ${issue.ruleDescription}`));
  if (errors.length) throw new Error(`Documentation quality failed:\n${errors.join('\n')}`);
}
export async function checkDocs(sourceRoot = root) {
  sourceRoot = await realpath(sourceRoot);
  const gitRoot = await realpath(execFileSync('git', ['rev-parse', '--show-toplevel'], {cwd: sourceRoot, encoding: 'utf8'}).trim());
  if (gitRoot !== sourceRoot) throw new Error('--source must be a Git repository root');
  // Include new author files before git add, while excluding ignored/generated files
  // and CI dependency checkouts. Paths with spaces are preserved by NUL separation.
  const names = [...new Set(execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', '*.md', '*.mdx', ...excluded.map(name => `:(exclude)${name}/**`)], {cwd: sourceRoot, encoding: 'utf8'}).split('\0').filter(Boolean))].sort();
  const strings = {};
  for (const name of names) {
    const filename = path.join(sourceRoot, name);
    if (!(await lstat(filename)).isFile()) throw new Error(`Documentation must be a regular file: ${name}`);
    strings[name] = await readFile(filename, 'utf8');
  }
  await checkMarkdown(strings);
  return names.length;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== '--source' || args[1].startsWith('--'))) throw new Error('Use docs:check [--source <repository-root>]');
    console.log(`Documentation quality passed for ${await checkDocs(args[1] || root)} Markdown/MDX files.`);
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
