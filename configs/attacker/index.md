---
title: "attacker"
config: "attacker"
os: "Linux"
category: "Attacker / offensive"
description: "Installs a baseline attacker toolkit (nmap, netcat, curl, wget, python3/pip, Flask)"
---

Installs a baseline attacker toolkit (nmap, netcat, curl, wget, python3/pip, Flask)

## Implementation

- Refreshes APT metadata and installs nmap, netcat, curl, wget, Python 3 and python3-pip.
- Installs Flask using the Ansible pip module. No listener or attack workflow is started.

Source: [Ansible task template](./ansible/attacker.j2).

The module is resolved from `configs/attacker/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with administrator privileges and access to APT repositories.
- A working Python package index for Flask. The guest Python environment must permit the pip install performed by the module.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("attacker").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
command -v nmap nc curl wget
python3 -m pip show Flask
```

The tools resolve and pip reports an installed Flask package.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
