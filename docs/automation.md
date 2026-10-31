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

## Configuration authoring and publication

Configurations live in `configs/<name>/` with a nonempty `ansible/<name>.j2` and
`index.md` (preferred) or README article. No manifest is required. The existing
52 website configuration articles were adopted into their matching source folders
without changing names, requirements or publication status. Future changes belong
in this source repository. Case-sensitive source names map to lowercase website
routes; underscores/dots map to hyphens and collisions are rejected.

```sh
npm run library:describe -- configuration linux-my-service --force
npm run library:export-configurations
```

The new/describe commands dispatch by kind; existing TTP commands remain valid.
`npm run check` validates and tests both collections. `library:export-website`
continues to export TTPs to `website-export/bundle.json`; configuration export uses
`website-config-export/bundle.json`, so the artifacts do not overwrite each other.

`validate-configs.yml` runs full validation on PRs, main pushes and manual dispatch,
then uploads `website-configurations` for 14 days. `notify-config-website.yml`
only dispatches `configuration-library-updated` after successful current-main
push/manual validation. The website `sync-config-library.yml` receiver verifies
source/workflow/revision/artifact/freshness and opens `configuration-library-sync`.
It commits only configuration articles and `library/configuration-library.json`.
Removed managed articles are drafted; heuristic and manual configuration entries
remain. Review and merge the website content PR to publish through Pages.

The same CRADLE_LANG_TOKEN permissions and recovery procedure described above
apply. Merge the website receiver before the source automation. To recover an
expired artifact, manually validate current main, then pass that successful run ID
to the configuration receiver's `source_run_id`. These checks do not render or
execute templates or validate remote downloads and runtime behavior.
