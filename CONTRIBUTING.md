# Contributing TTP heuristics

TTP modules live in `heuristics/ttp/<TECHNIQUE-ID>/`. Use an ATT&CK technique ID
such as `T1105` or sub-technique ID such as `T1053.003`. Configuration modules
remain under `configs/`; CVEs are authored separately in cradle-lib-cve.

## Set up

Use Git and Node.js 22 or newer. Fork this repository if necessary, clone it,
update `main` and create a branch such as `add-ttp-t1105`.

```sh
npm ci
```

Copy `.env.example` to `.env` if you do not already have one, and configure your
OpenAI-compatible server, model and API key. Never commit `.env`.

## Import your module and generate its article

Prepare an existing module folder with `README.md`, `manifest.json`, a nonempty
`ansible/<TECHNIQUE-ID>.j2` and any supporting files. For example:

```json
{
  "framework": "ttp",
  "value": "T1105",
  "os": null,
  "os_version": null,
  "configs": []
}
```

Use real requirements; OS/version must be paired nonempty strings or null.
Then run this command from the repository root, replacing the ID and source path:

```powershell
npm run library:new -- ttp T1105 --from "C:\path\to\MyTtp" --generate-index
```

This copies your module to `heuristics/ttp/T1105/` and generates `index.md` using
`library/_templates/heuristic/index.md`, copied from the website's heuristic template.
The original folder is unchanged. Existing destination modules are never overwritten.
An authored source `index.md` is preserved, even with `--generate-index`.
Selected module text is sent to your configured model. Hidden files and TOML are
excluded from model context; binary contents are not sent. Review reported omissions.

## Review and submit

Review the generated article against your implementation, including ATT&CK mapping,
requirements, usage, verification, attribution and licensing. Generated articles
start with `draft: true`; set `draft: false` when ready for publication. Keep
`framework: ttp` and the exact identifier. Do not add `id`, `slug` or `sourceUrl`.
Automation supplies the commit-pinned module link and rewrites relative file links.

Commit the complete module folder and open a draft PR against this repository's
`main`. Include checks actually run and runtime limitations. Mark it ready for
review when complete. CI checks identities, templates, local links, exported
Markdown and implied configurations, and runs script tests. It does not deploy
or execute the technique.

After source merge, successful full validation opens or updates a separate website
PR containing articles and module links. Website review, merge and successful Pages
deployment are required to publish articles with `draft: false`. Implementation
files stay here. Contributors do not need to export or synchronize manually.

See the [website guide](https://cradle-lang.org/docs/guides/contribute-ttp) for the
full walkthrough and [automation reference](docs/automation.md) for recovery.

## Contributing configuration modules

Configurations are authored under `configs/<name>/` in this repository and do not
require `manifest.json`. Include a nonempty `ansible/<name>.j2`, supporting files
and a README describing requirements, parameters, verification and attribution.
Use the existing setup and `.env` instructions above, then run:

```powershell
npm run library:new -- configuration linux-my-service --from "C:\path\to\MyConfiguration" --generate-index
```

The command uses `library/_templates/configuration/index.md`, copied from the
website configuration template. It preserves the original source and an existing
authored `index.md`, refuses destination overwrite and starts generated articles
as drafts. Review the generated `configs/linux-my-service/index.md`, including
`config`, `os`, `category`, implementation, requirements and licensing. Allowed OS
labels are Linux, Windows, Cross-platform and Unspecified. The exact config name
must match its folder and template, including case. Prefer lowercase new names.
Set `draft: false` when ready for publication; do not add `sourceUrl` or article IDs.

Commit the complete module folder and open a draft source PR. CI checks required
templates, metadata, local links, exported Markdown and script tests. It does not
render or execute provisioning. Successful main validation opens/updates a separate
website review PR with articles and automatic commit-pinned module links. Website
PR merge and successful Pages deployment are required for publication.

See the [configuration contribution guide](https://cradle-lang.org/docs/guides/contribute-configuration).

## Documentation quality

Run `npm run docs:check` before submitting. It checks Markdown and MDX using the
same `.markdownlint.json` rules as the website, including new unstaged documents.
Ignored/generated files and CI dependency checkouts are excluded. Errors identify
the file, line and rule; fix the source rather than weakening the rules.

GitHub exposes a separate **Docs Quality / markdownlint** check on PRs, main pushes
and manual runs. `npm run check` also runs it before validation and website export,
so documentation-quality failures prevent the automated website handoff.
