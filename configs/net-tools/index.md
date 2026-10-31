---
title: "net-tools"
config: "net-tools"
os: "Linux"
category: "Linux — services & network"
description: "Installs the net-tools package (ifconfig, netstat, ...)"
---

Installs the net-tools package (ifconfig, netstat, ...)

## Implementation

- Installs the APT package `net-tools` with `state: present`.

Source: [Ansible task template](./ansible/net-tools.j2).

The module is resolved from `configs/net-tools/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator privileges and access to its configured package repositories.
- The package must be available for the guest distribution. The module does not pin a package version.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("net-tools").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
dpkg-query -W net-tools
command -v ifconfig
command -v netstat
```

The package is installed and both commands resolve to executables.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
