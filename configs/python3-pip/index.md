---
title: "python3-pip"
config: "python3-pip"
os: "Linux"
category: "Linux — services & network"
description: "Installs python3-pip"
---

Installs python3-pip

## Implementation

- Checks `python3 -m pip --version` and uses APT to install python3-pip only if pip is missing.
- If pip is still unavailable, reads `index-url` and optional `trusted-host` from `/etc/pip.conf`, downloads the pip 24.0 wheel from that index and bootstraps pip.
- Finishes with another `python3 -m pip --version` check.

Source: [Ansible task template](./ansible/python3-pip.j2).

The module is resolved from `configs/python3-pip/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with Python 3, administrator privileges and configured APT repositories.
- The fallback needs curl, awk and `/etc/pip.conf` with an index-url serving `pip/pip-24.0-py3-none-any.whl`. The bootstrap downloads with curl, so the URL must also satisfy curl's connectivity and certificate requirements.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("python3-pip").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
python3 -m pip --version
```

pip reports a version and its installed location. An existing working pip installation is retained.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
