---
title: "linux-mysql"
config: "linux-mysql"
os: "Linux"
category: "Linux — services & network"
description: "Installs and starts MySQL Server"
---

Installs and starts MySQL Server

## Implementation

- Installs the APT package `mysql-server` with `state: present`. Starts and enables the `mysql` service.

Source: [Ansible task template](./ansible/linux-mysql.j2).

The module is resolved from `configs/linux-mysql/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator privileges and access to its configured package repositories.
- The package must be available for the guest distribution. The module does not pin a package version.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-mysql").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
mysql --version
systemctl is-active mysql
```

The client prints its installed version and the service reports active.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
