# cradle-lib

External content library for [CradleXC](https://github.com/cradle-lang/CradleXC)
(`cxc` / the internal `cxc-dev` tool): every `config()` and
`heuristic("<framework>", "<value>")` a `.cradle` scenario can reference
resolves against this repository by default.

## How it's used

`cxc`'s `config_dir` and `heuristics_dir` settings (see `cxc config` /
`/opt/cxc/config.toml`) both default to this repo's URL — the same URL for
both, distinguished only by which top-level folder (`configs/` vs
`heuristics/`) a given build reads from:

```toml
config_dir = "https://github.com/cradle-lang/cradle-lib"
heuristics_dir = "https://github.com/cradle-lang/cradle-lib"
```

Either setting also accepts a local folder path instead of a git URL, for
working on content offline before pushing it here.

When a scenario references a `config()`/`heuristic()` that isn't already
present locally, `cxc build` / `deploy` / `emit` / `update` (and their
`cxc-dev` equivalents) sparse-fetch just that one subtree from this repo —
never a full clone — into a per-URL cache under `~/.cxc/cache/`. Adding new
configs or heuristics here never grows what a single deploy has to fetch.

## Layout

```text
configs/
  <config>/
    ansible/<config>.j2   # Tera-rendered Ansible task list (required)
    files/                # optional assets referenced by the template
heuristics/
  <framework>/
    <value>/
      manifest.json        # os / os_version / configs this heuristic implies
      ansible/<value>.j2   # Tera-rendered Ansible task list (required)
      files/                # optional assets referenced by the template
```

See [`configs/README.md`](./configs) for the full list of available configs,
and [`heuristics/README.md`](./heuristics) for heuristic frameworks, the
`manifest.json` contract, and available modules.
