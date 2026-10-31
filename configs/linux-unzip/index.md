---
title: "linux-unzip"
config: "linux-unzip"
os: "Linux"
category: "Linux — services & network"
description: "Installs unzip"
---

Installs unzip

## Implementation

- Installs the APT package `unzip` with `state: present`.

Source: [Ansible task template](./ansible/linux-unzip.j2).

The module is resolved from `configs/linux-unzip/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator privileges and access to its configured package repositories.
- The package must be available for the guest distribution. The module does not pin a package version.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-unzip").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
unzip -v
```

The command reports the installed unzip version.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
