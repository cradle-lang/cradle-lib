---
title: "linux-ntp"
config: "linux-ntp"
os: "Linux"
category: "Linux — services & network"
description: "Installs and configures Chrony as an NTP server"
---

Installs and configures Chrony as an NTP server

## Implementation

- Installs Chrony and replaces `/etc/chrony/chrony.conf` with pool `2.debian.pool.ntp.org iburst` and `allow all`.
- Enables and restarts the Chrony service.

Source: [Ansible task template](./ansible/linux-ntp.j2).

The module is resolved from `configs/linux-ntp/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator access and package repository connectivity.
- DNS and NTP access to the configured pool for synchronization. Exercise network policy must allow the intended clients to reach the server.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-ntp").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
systemctl is-active chrony
chronyc sources -v
chronyc tracking
```

Chrony is active. Once an upstream source is reachable, sources and tracking show synchronization status.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
