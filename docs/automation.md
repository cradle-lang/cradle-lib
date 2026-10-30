# TTP documentation automation

## Maintainer checks and recovery

```sh
npm run check
node scripts/check-configs.mjs
npm run library:export-website
```

`library:check` validates all TTP modules, links and exported website Markdown.
`check-configs.mjs` checks manifest-implied configuration templates in this checkout
and recognizes compiler routing builtins. Neither renders or executes templates.
The export uses `index.md` first and falls back to legacy `README.md`. Legacy
articles without a draft flag remain published; generated articles start as drafts.

To regenerate an existing article after configuring `.env`:

```sh
npm run library:describe -- T1105 --force
```

Generation failures preserve copied module files and the starter article. A newer
concurrent article edit is preserved. Generation uses a bounded text inventory;
review omissions and truncation. This is documentation generation, not runtime testing.

## GitHub handoff

`validate-ttps.yml` runs on PRs, pushes to main and manual dispatches. It validates
all TTPs and uploads `website-ttps` (14-day retention). `notify-website.yml` only
notifies after successful full push/manual validation of current main. PR runs
cannot trigger trusted website imports. No implementation files are executed.

The website receiver `sync-ttp-library.yml` verifies repository, workflow, branch,
event, revision, artifact identity, size and freshness, imports articles and runs
website checks before opening/updating the `ttp-library-sync` PR. Deleted managed
entries are drafted; CVEs and unrelated articles are preserved. Source merge alone
does not publish content. Merge the website review PR and confirm Pages deployment.

Configure `CRADLE_LANG_TOKEN` in both cradle-lib and cradle-lang.github.io. The token
needs Contents write on the website to dispatch, Contents/Pull requests write to
create its PR, and Actions/Contents read on cradle-lib to read source runs/artifacts.
A fine-grained token must use cradle-lang as resource owner and include both repos.
Never store a token in tracked files.

For an expired artifact, dispatch full validation on current source main, then use
its successful run ID as `source_run_id` in the website receiver's manual dispatch.
Old source revisions are skipped. Initial setup requires merging the receiver into
the website default branch before the first source-main handoff.
