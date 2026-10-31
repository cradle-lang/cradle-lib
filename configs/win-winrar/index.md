---
title: "win-winrar"
config: "win-winrar"
os: "Windows"
category: "Windows — tooling"
description: "Installs WinRAR"
---

Installs WinRAR

## Implementation

- Installs the `winrar` Chocolatey package with `state: present`. The package version is not pinned.

Source: [Ansible task template](./ansible/win-winrar.j2).

The module is resolved from `configs/win-winrar/` in the configured `config_dir`.

## Requirements

- A Windows guest with administrator privileges, Chocolatey package-source access and the Ansible win_chocolatey module.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-winrar").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
(Get-Item "C:\Program Files\WinRAR\WinRAR.exe").VersionInfo | Select-Object ProductVersion
```

WinRAR exists at the package's installed path and reports a version; adjust the path if the package uses another location.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
