---
title: "linux-auditd"
config: "linux-auditd"
os: "Linux"
category: "Linux — observability"
description: "Installs auditd with a bundled custom audit rules file"
---

Installs auditd with a bundled custom audit rules file

## Implementation

- Installs auditd, copies the bundled rules to `/etc/audit/rules.d/audit.rules`, then enables and restarts auditd.
- The bundled rules begin with `-D`, clearing previously loaded rules when applied, and include watches for audit configuration and audit tooling. Review them alongside existing host audit policy.

Source: [Ansible task template](./ansible/linux-auditd.j2). Supporting [assets](./files) are required by the tasks described above.

The module is resolved from `configs/linux-auditd/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator access and Linux audit support.
- The backend must expose the bundled `files/audit.rules` through `config_asset_dir`.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-auditd").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
sudo auditctl -s
sudo auditctl -l
systemctl is-active auditd
```

The audit subsystem responds, the intended rules appear and auditd reports active.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
