---
title: "linux-ufw"
config: "linux-ufw"
os: "Linux"
category: "Linux — services & network"
description: "Installs UFW and allows SSH"
---

Installs UFW and allows SSH

## Implementation

- Installs UFW, adds a TCP port 22 allow rule and enables the firewall.
- No additional application-specific allow rules are added.

Source: [Ansible task template](./ansible/linux-ufw.j2).

The module is resolved from `configs/linux-ufw/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator privileges and package repositories.
- The backend must provide the Ansible ufw module. Add any other rules required by the exercise and its management connection.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-ufw").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
sudo ufw status verbose
```

UFW reports active and shows a TCP/22 allow rule.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
