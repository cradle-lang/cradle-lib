---
title: "linux-dns"
config: "linux-dns"
os: "Linux"
category: "Linux — services & network"
description: "Installs and configures Bind9 as a DNS resolver/server"
---

Installs and configures Bind9 as a DNS resolver/server

## Implementation

- Replaces `/etc/resolv.conf` with resolvers `8.8.8.8` and `1.1.1.1`.
- Installs Bind9, then enables and restarts it. The module does not create a custom DNS zone.

Source: [Ansible task template](./ansible/linux-dns.j2).

The module is resolved from `configs/linux-dns/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT and administrator privileges.
- The guest must be able to reach the configured resolvers and package repositories. Other resolver-management services may subsequently rewrite `/etc/resolv.conf`.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-dns").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
cat /etc/resolv.conf
sudo named-checkconf
systemctl is-active bind9
```

The configured resolvers appear, named-checkconf exits successfully and Bind9 reports active.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
