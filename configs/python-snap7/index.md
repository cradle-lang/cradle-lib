---
title: "python-snap7"
config: "python-snap7"
os: "Linux"
category: "Linux — services & network"
description: "Installs the pinned python-snap7 library"
---

Installs the pinned python-snap7 library

## Implementation

- Installs `python-snap7==1.3` using the Ansible pip module with administrator privileges.

Source: [Ansible task template](./ansible/python-snap7.j2).

The module is resolved from `configs/python-snap7/` in the configured `config_dir`.

## Requirements

- A Linux guest with a working Python/pip environment and permission to install packages globally.
- Access to a Python package index containing the specified packages. The template does not install Python or pip; provision those dependencies separately.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("python-snap7").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
python3 -m pip show python-snap7
python3 -c "import snap7"
```

pip reports the installed packages and the import check exits successfully. For pinned packages, confirm that the reported versions match the template.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
