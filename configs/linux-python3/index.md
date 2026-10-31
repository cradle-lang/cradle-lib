---
title: "linux-python3"
config: "linux-python3"
os: "Linux"
category: "Linux — services & network"
description: "Ensures Python 3 is installed"
---

Ensures Python 3 is installed

## Implementation

- Checks `dpkg-query -l python3`. If that check fails, installs python3-debian, adds the deadsnakes Ubuntu PPA for the guest release and installs python3.
- Leaves an already installed Python 3 package in place; the template does not select a specific Python version.

Source: [Ansible task template](./ansible/linux-python3.j2).

The module is resolved from `configs/linux-python3/` in the configured `config_dir`.

## Requirements

- An Ubuntu guest with dpkg/APT, administrator privileges and a release supported by the configured PPA if installation is needed.
- The controller needs `ansible.builtin.deb822_repository`. The installation branch needs access to APT, the PPA and the Ubuntu keyserver.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-python3").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
dpkg-query -W python3
python3 --version
```

The python3 package is installed and the interpreter reports a version.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
