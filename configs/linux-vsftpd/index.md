---
title: "linux-vsftpd"
config: "linux-vsftpd"
os: "Linux"
category: "Linux — services & network"
description: "Installs and configures vsftpd (FTP server)"
---

Installs and configures vsftpd (FTP server)

## Implementation

- Installs vsftpd and replaces `/etc/vsftpd.conf` with local-user access, writes enabled, anonymous access disabled and TLS disabled.
- Creates `/srv/ftp` and a world-writable `/srv/ftp/upload` directory, then enables/restarts vsftpd.
- The template does not create login users or set their FTP home directories.

Source: [Ansible task template](./ansible/linux-vsftpd.j2).

The module is resolved from `configs/linux-vsftpd/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator privileges and package repositories.
- Existing local users for authentication and exercise network rules allowing the chosen FTP connection mode. The configured snakeoil certificate paths must be present even though TLS is disabled.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-vsftpd").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
systemctl is-active vsftpd
sudo grep -E "^(anonymous_enable|local_enable|write_enable|ssl_enable)=" /etc/vsftpd.conf
stat -c "%a %n" /srv/ftp/upload
```

vsftpd is active, the listed settings match the template and the upload directory mode is 777. Test a login with a user supplied by the exercise.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
