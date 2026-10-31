---
title: "win-sysmon"
config: "win-sysmon"
os: "Windows"
category: "Windows — observability"
description: "Installs Sysmon with a bundled configuration"
---

Installs Sysmon with a bundled configuration

## Implementation

- Stages the Sysmon archive and bundled XML config under `C:\Users\vagrant`, then extracts the archive.
- Checks both Sysmon and Sysmon64 registry service keys. If neither exists, installs Sysmon with the supplied configuration and the `-accepteula` option.
- On an existing installation, attempts a configuration refresh and tolerates failure. Inspect the effective service/configuration after provisioning.

Source: [Ansible task template](./ansible/win-sysmon.j2). Supporting [assets](./files) are required by the tasks described above.

The module is resolved from `configs/win-sysmon/` in the configured `config_dir`.

## Requirements

- A Windows guest with administrator privileges and the `C:\Users\vagrant` path.
- The backend must expose `files/Sysmon.zip` and `files/the-sysmon-config.xml` through `config_asset_dir`; the controller needs the Windows unzip task support.
- The installed service name depends on the bundled Sysmon executable.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-sysmon").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
Get-Service -Name Sysmon,Sysmon64 -ErrorAction SilentlyContinue
Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" -MaxEvents 5
```

One Sysmon service is Running and the operational log is available. Generate the intended test activity to check the supplied event configuration.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
