# cradle-heuristics

External heuristic content for CradleXC (`cxc`). Each heuristic declared on an
instance as `heuristic("<framework>", "<value>")` resolves to an Ansible
task-list fragment pulled from this repo by `cxc heuristics pull` and rendered
into the provisioning playbook at deploy time.

## Layout

```
heuristics/
  <framework>/<value>/ansible/<value>.j2            # setup   (required)
  <framework>/<value>/ansible/<value>-teardown.j2   # teardown (optional)
```

- `<value>.j2` is a **Tera** template. Its rendered output is spliced verbatim
  into a play's `tasks:` list, so each task starts at 4-space indent and the
  enclosing play already runs `become: yes` on Linux.
- Because Tera renders first, any **Ansible-native Jinja** (`{{ ansible_facts... }}`,
  `when:` version tests, Go/`docker` format templates) must be wrapped in
  `{% raw %}...{% endraw %}`, or Tera will try to evaluate it.
- Available Tera variables: `config_asset_dir` (this heuristic's folder, for
  shipping asset files alongside the template), `linux_guest_home_dir`,
  `linux_guest_artifact_dir`.
- `<value>-teardown.j2` is optional. `cxc update` renders it for any heuristic
  present in the previous deploy but not the new one, **before** the new
  heuristic's setup, so a swapped-out CVE releases whatever its replacement
  will claim (a port, a package, a service).

## Contents

| Framework | Value | What it does | Teardown | Exposes |
|-----------|-------|--------------|----------|---------|
| cve | CVE-2021-41773 | Vulnerable `httpd:2.4.49` (path traversal / RCE) in Docker | `docker rm` | `:8041` |
| cve | CVE-2021-44228 | Log4Shell vulnerable demo app in Docker | `docker rm` | `:8042` |
| cve | CVE-2024-1086 | Version-gated: pins the box to an exact kernel | — (see below) | — |
| ttp | T1053.003 | Cron persistence (beacon script + root crontab entry) | removes both | — |
| ttp | T1105 | Ingress tool transfer (pulls tooling to the host) | removes the tool | — |

### CVE-2024-1086 — version-gated kernel policy

`CVE-2024-1086.j2` demonstrates the project's version-remediation policy against
a **pinned** kernel (`PINNED_KERNEL`, default `5.15.0-25-generic`):

- running kernel **<** pinned → install the pinned kernel + `update-grub` + reboot
- running kernel **>** pinned → **hard fail** (never downgrade automatically)
- running kernel **==** pinned → no-op

The default pin is intentionally an *old* 22.04 kernel, so on a patched box the
"refuse to downgrade" branch fires and **no reboot happens** — safe for a first
smoke test. Raise the pin above the box's running kernel to deliberately exercise
the install-and-reboot path. There is no teardown template: a kernel install/reboot
is not something to auto-undo.

## Notes

- The two web CVEs use the **docker CLI** (`docker.io` package), not the
  `community.docker` Ansible collection, so nothing beyond Docker itself has to
  be installed on the target.
- `CVE-2021-44228` pulls `ghcr.io/christophetd/log4shell-vulnerable-app:latest`
  (public), so the target needs outbound network to ghcr.io.

## Pulling into a cxc host

```
cxc heuristics pull cve CVE-2021-41773
cxc heuristics pull cve CVE-2021-44228
cxc heuristics pull cve CVE-2024-1086
cxc heuristics pull ttp T1053.003
cxc heuristics pull ttp T1105
```

Each command sparse-fetches only that one `heuristics/<framework>/<value>`
subtree into the host's `heuristics_dir` (default `/opt/cxc/heuristics`).
