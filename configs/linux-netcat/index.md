---
title: "linux-netcat"
config: "linux-netcat"
os: "Linux"
category: "Linux — services & network"
description: "Installs netcat"
---

Installs netcat

## Implementation

- Installs the APT package `netcat` with `state: present`.

Source: [Ansible task template](./ansible/linux-netcat.j2).

The module is resolved from `configs/linux-netcat/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator privileges and access to its configured package repositories.
- The package must be available for the guest distribution. The module does not pin a package version.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-netcat").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
dpkg-query -W netcat
command -v nc
```

The package is installed and nc resolves to an executable. Distribution alternatives determine the netcat implementation.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
