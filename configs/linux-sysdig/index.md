---
title: "linux-sysdig"
config: "linux-sysdig"
os: "Linux"
category: "Linux — observability"
description: "Installs sysdig from a vendored package release"
---

Installs sysdig from a vendored package release

## Implementation

- Copies bundled `sysdig.deb` to `/tmp/sysdig.deb` and installs it through APT.
- Installs `sysdig.service`, reloads systemd and starts/enables the service. The bundled service runs `/usr/bin/sysdig -w /var/log/sysdig.scap` as root.
- Other scripts and platform packages in `files/` are not installed by this template.

Source: [Ansible task template](./ansible/linux-sysdig.j2). Supporting [assets](./files) are required by the tasks described above.

The module is resolved from `configs/linux-sysdig/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest compatible with the bundled .deb, administrator access, APT repositories for its dependencies and systemd.
- Sysdig requires compatible guest kernel capture support and enough disk space for `/var/log/sysdig.scap`.
- The backend must supply `files/sysdig.deb` and `files/sysdig.service` through `config_asset_dir`.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-sysdig").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
sysdig --version
systemctl is-active sysdig
sudo ls -lh /var/log/sysdig.scap
```

Sysdig is installed, its service is active and a capture file is being written when kernel capture support is available.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
