---
title: "python-influxdb-win"
config: "python-influxdb-win"
os: "Windows"
category: "Windows — tooling"
description: "Installs the InfluxDB client into the shared Windows runtime"
---

Installs the InfluxDB client into the shared Windows runtime

## Implementation

- Installs `influxdb==5.3.2` using the shared Windows runtime at `C:\ProgramData\cxc\python\python.exe`.
- Writes `C:\ProgramData\cxc\python-influxdb.installed` after a successful install and uses that marker to skip subsequent runs. A marker does not independently verify that the packages remain installed.

Source: [Ansible task template](./ansible/python-influxdb-win.j2).

The module is resolved from `configs/python-influxdb-win/` in the configured `config_dir`.

## Requirements

- A Windows guest with administrator access and `win-python-runtime` provisioned first. The package task does not install the shared runtime itself.
- Access to a Python package index containing the specified packages and compatible Windows distributions.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("python-influxdb-win").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
& "C:\ProgramData\cxc\python\python.exe" -m pip show influxdb
& "C:\ProgramData\cxc\python\python.exe" -c "import influxdb"
```

pip reports the installed packages and the import check exits successfully. For pinned packages, confirm that the reported versions match the template.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
