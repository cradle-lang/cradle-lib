import {readFile} from 'node:fs/promises';
import {lint} from 'markdownlint/promise';

// Keep the rule snapshot aligned with cradle-lang.github.io/.markdownlint.json.
const config = JSON.parse(await readFile(new URL('../.markdownlint.json', import.meta.url), 'utf8'));
export async function checkWebsiteMarkdown(bundle) {
  const strings = Object.fromEntries(bundle.entries.map(entry => [`${entry.module}/index.md`, entry.article]));
  const results = await lint({strings, config});
  const errors = Object.entries(results).flatMap(([file, issues]) => issues.map(issue => `${file}:${issue.lineNumber} ${issue.ruleNames[0]} ${issue.ruleDescription}`));
  if (errors.length) throw new Error(`Exported website Markdown failed lint:\n${errors.join('\n')}`);
}
