---
title: "win-python"
config: "win-python"
os: "Windows"
category: "Windows — tooling"
description: "Installs Python via Chocolatey"
---

Installs Python via Chocolatey

## Implementation

- Ensures the Chocolatey package manager is present, then installs its `python` package.
- Neither package is pinned to a version. This is separate from the bundled `win-python-runtime` used by the pinned Windows Python dependency modules.

Source: [Ansible task template](./ansible/win-python.j2).

The module is resolved from `configs/win-python/` in the configured `config_dir`.

## Requirements

- A Windows guest with administrator privileges, the Ansible win_chocolatey module and access to Chocolatey package sources.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-python").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
python --version
python -m pip --version
```

Python reports an installed version. Check pip availability in the same newly opened session or by using the installed executable path.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
