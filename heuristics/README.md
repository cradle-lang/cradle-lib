# Heuristics Library

This directory contains external heuristic content modules for CradleXC (`cxc`). Each heuristic simulates a security vulnerability or adversary behavior (TTP) that can be applied to target instances during provisioning.

## Declaration and Usage

Heuristics are declared on an instance in CradleXC configurations using:

```text
heuristic("<framework>", "<value>")
```

When deployed:
1. `cxc heuristics pull <framework> <value>` sparse-fetches the heuristic directory from this repository into the host's `heuristics_dir` (default `/opt/cxc/heuristics`).
2. The template at `heuristics/<framework>/<value>/ansible/<value>.j2` is rendered via Tera and spliced directly into the provisioning Ansible playbook's task list (executing with `become: yes` on Linux).

## Directory Layout

```text
heuristics/
  <framework>/
    <value>/
      ansible/
        <value>.j2       # Tera-rendered Ansible task list (required)
```

- `<framework>`: The classification taxonomy (e.g., `cve`, `ttp`).
- `<value>`: The identifier of the vulnerability or technique (e.g., `CVE-2021-41773`, `T1053.003`).
- `ansible/<value>.j2`: Tera template spliced into the Ansible play. Because Tera renders first, any native Jinja2 expressions (`{{ ... }}`) must be wrapped in `{% raw %}...{% endraw %}`.

## Available Frameworks

| Framework | Description | Available Modules |
|-----------|-------------|-------------------|
| [`cve`](./cve) | Common Vulnerabilities and Exposures | `CVE-2021-41773`, `CVE-2021-44228`, `CVE-2024-1086` |
| [`ttp`](./ttp) | MITRE ATT&CK Tactics, Techniques, and Procedures | `T1053.003`, `T1105` |
