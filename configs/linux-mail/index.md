---
title: "linux-mail"
config: "linux-mail"
os: "Linux"
category: "Linux — services & network"
description: "Installs Bind9 and mail-related packages for a mail-server role"
---

Installs Bind9 and mail-related packages for a mail-server role

## Implementation

- Installs Bind9, Postfix and Dovecot with IMAP, POP3, LDAP and LMTP packages.
- Writes a `deadbeef.com` DNS zone whose A and MX records use the provisioned host address. Replaces the local Bind9, Postfix and Dovecot configuration files.
- Configures Maildir delivery, PAM/password-backed Dovecot authentication, Postfix SASL integration and the guest snakeoil TLS certificate. Enables and restarts all three services.

Source: [Ansible task template](./ansible/linux-mail.j2).

The module is resolved from `configs/linux-mail/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator access and package repository connectivity.
- The backend must provide `ansible_host` when rendering the DNS zone. Certificate and key files referenced under `/etc/ssl/` must exist.
- The template hardcodes `deadbeef.com`; adapt it for another domain. It does not create mail users, passwords or a production certificate.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-mail").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
sudo named-checkconf
sudo postfix check
sudo doveconf -n
systemctl is-active bind9 postfix dovecot
```

Configuration checks complete and all three services report active. Verify DNS resolution and mail delivery with accounts and clients supplied by your exercise.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
