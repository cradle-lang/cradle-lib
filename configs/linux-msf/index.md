---
title: "linux-msf"
config: "linux-msf"
os: "Linux"
category: "Attacker / offensive"
description: "Installs the Metasploit Framework"
---

Installs the Metasploit Framework

## Implementation

- Downloads Rapid7's msfinstall wrapper, makes it executable and runs it from the provisioning shell.
- Skips the installer when `/usr/bin/msfconsole` already exists.

Source: [Ansible task template](./ansible/linux-msf.j2).

The module is resolved from `configs/linux-msf/` in the configured `config_dir`.

## Requirements

- A Linux guest compatible with the upstream installer, with curl, a shell and permission to install system packages.
- Access to the Rapid7 wrapper on raw.githubusercontent.com and any repositories contacted by that installer.
- This task does not declare `become`; the surrounding play or connection must provide the required installation privileges.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-msf").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
test -x /usr/bin/msfconsole
msfconsole --version
```

The executable exists and reports a Metasploit version.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
