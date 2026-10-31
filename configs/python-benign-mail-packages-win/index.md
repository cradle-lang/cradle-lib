---
title: "python-benign-mail-packages-win"
config: "python-benign-mail-packages-win"
os: "Windows"
category: "Cross-platform & decoy"
description: "Installs a benign set of Python mail-handling packages (Windows)"
---

Installs a benign set of Python mail-handling packages (Windows)

## Implementation

- Installs `IMAPClient`, `pyzmail36` using `pip` on the provisioning account's PATH.

Source: [Ansible task template](./ansible/python-benign-mail-packages-win.j2).

The module is resolved from `configs/python-benign-mail-packages-win/` in the configured `config_dir`.

## Requirements

- A Windows guest with Python and pip on the provisioning account's PATH. These tasks use bare pip, so choose the interpreter/environment deliberately.
- Access to a Python package index containing the specified packages and compatible Windows distributions.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("python-benign-mail-packages-win").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
python -m pip show IMAPClient pyzmail36
python -c "import imapclient, pyzmail"
```

pip reports the installed packages and the import check exits successfully. For pinned packages, confirm that the reported versions match the template.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
