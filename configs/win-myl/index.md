---
title: "win-myl"
config: "win-myl"
os: "Windows"
category: "Windows — tooling"
description: "Installs the myl Python package via pip"
---

Installs the myl Python package via pip

## Implementation

- Runs `pip install --user myl` under the provisioning account.
- Does not install Python/pip or pin a myl version. Other accounts do not automatically share that user-site installation.

Source: [Ansible task template](./ansible/win-myl.j2).

The module is resolved from `configs/win-myl/` in the configured `config_dir`.

## Requirements

- A Windows guest with Python and pip on the provisioning account's PATH and access to its configured package index.
- Use the same Python environment and user account when checking the installation.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-myl").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
pip show myl
```

pip reports myl in the provisioning account's user-site environment.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
