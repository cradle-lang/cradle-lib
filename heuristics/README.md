# Heuristics Library

This directory contains external heuristic content modules for CradleXC
(`cxc`). Each heuristic simulates a vulnerability or adversary behaviour
(TTP) that can be applied to target instances during provisioning.

## Declaration and Usage

Heuristics are declared on an instance in a `.cradle` scenario:

```text
heuristic("<framework>", "<value>")
```

The content is resolved from the configured `heuristics_dir` (a local folder
or a git URL such as this repository). If the scenario omits `os()` and/or
some `config()`, cxc can fill them in from the heuristic's `manifest.json`
(see below) or, for packaged heuristics, from the shipped heuristics DB.

## Directory Layout

```text
heuristics/
  <framework>/
    <value>/
      manifest.json          # os / os_version / configs this heuristic needs
      ansible/
        <value>.j2           # Tera-rendered Ansible task list (required)
      files/                 # optional assets referenced by the template
      README.md
```

## manifest.json

Every heuristic carries a `manifest.json` describing what the heuristic
requires; it is the source of truth for cxc's `os()`/`config()` inference:

```json
{
  "framework": "cve",
  "value": "CVE-2021-41773",
  "os": "ubuntu",
  "os_version": "20.04",
  "configs": ["linux-auditd"]
}
```

Fields:

- `framework`: the framework folder (`cve`, `ttp`, ...); must match the path.
- `value`: the heuristic folder name; must match the path.
- `os` / `os_version`: implied OS requirement. Use `null` when the heuristic
  has no specific OS requirement (classification-only heuristics).
- `configs`: additional configs to merge into the instance (empty list if
  none).

An explicit `os()` in the scenario always wins over the manifest; cxc warns
when they disagree. Implied configs are appended and deduplicated.

## Available Frameworks

| Framework | Description | Available Modules |
|-----------|-------------|-------------------|
| [`cve`](./cve) | Common Vulnerabilities and Exposures | `CVE-2017-15715`, `CVE-2019-14287`, `CVE-2021-41773`, `CVE-2021-42013`, `CVE-2021-4034`, `CVE-2021-3156`, `CVE-2021-44228`, `CVE-2022-0847`, `CVE-2024-1086` |
| [`ttp`](./ttp) | MITRE ATT&CK Tactics, Techniques, and Procedures | `T1053.003`, `T1105` |
