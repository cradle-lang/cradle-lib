---
title: "python-influxdb"
config: "python-influxdb"
os: "Linux"
category: "Linux — services & network"
description: "Installs the pinned InfluxDB Python client"
---

Installs the pinned InfluxDB Python client

## Implementation

- Installs `influxdb==5.3.0` using the Ansible pip module with administrator privileges.

Source: [Ansible task template](./ansible/python-influxdb.j2).

The module is resolved from `configs/python-influxdb/` in the configured `config_dir`.

## Requirements

- A Linux guest with a working Python/pip environment and permission to install packages globally.
- Access to a Python package index containing the specified packages. The template does not install Python or pip; provision those dependencies separately.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("python-influxdb").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
python3 -m pip show influxdb
python3 -c "import influxdb"
```

pip reports the installed packages and the import check exits successfully. For pinned packages, confirm that the reported versions match the template.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
