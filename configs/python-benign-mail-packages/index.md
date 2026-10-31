---
title: "python-benign-mail-packages"
config: "python-benign-mail-packages"
os: "Linux"
category: "Cross-platform & decoy"
description: "Installs a benign set of Python mail-handling packages (Linux)"
---

Installs a benign set of Python mail-handling packages (Linux)

## Implementation

- Installs `IMAPClient`, `pyzmail36` using the Ansible pip module with administrator privileges.

Source: [Ansible task template](./ansible/python-benign-mail-packages.j2).

The module is resolved from `configs/python-benign-mail-packages/` in the configured `config_dir`.

## Requirements

- A Linux guest with a working Python/pip environment and permission to install packages globally.
- Access to a Python package index containing the specified packages. The template does not install Python or pip; provision those dependencies separately.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("python-benign-mail-packages").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
python3 -m pip show IMAPClient pyzmail36
python3 -c "import imapclient, pyzmail"
```

pip reports the installed packages and the import check exits successfully. For pinned packages, confirm that the reported versions match the template.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
