---
title: "win-chocolatey"
config: "win-chocolatey"
os: "Windows"
category: "Windows — tooling"
description: "Installs the Chocolatey package manager"
---

Installs the Chocolatey package manager

## Implementation

- Runs the Chocolatey bootstrap script from chocolatey.org, with a process-scoped execution-policy bypass and TLS 1.2 enabled.
- Skips the bootstrap when `C:\ProgramData\chocolatey\bin\choco.exe` exists.

Source: [Ansible task template](./ansible/win-chocolatey.j2).

The module is resolved from `configs/win-chocolatey/` in the configured `config_dir`.

## Requirements

- A Windows guest with PowerShell, administrator privileges and HTTPS connectivity to the Chocolatey bootstrap and its package sources.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-chocolatey").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
& "C:\ProgramData\chocolatey\bin\choco.exe" --version
```

The Chocolatey executable reports its version.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
