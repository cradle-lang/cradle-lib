---
title: "win-winrm"
config: "win-winrm"
os: "Windows"
category: "Windows — system & network"
description: "Ensures WinRM is enabled and running"
---

Ensures WinRM is enabled and running

## Implementation

- Requests the WinRM Windows feature and starts the WinRM service.
- Does not configure listeners, authentication policy or firewall rules. It cannot establish the initial management connection needed to run these tasks.

Source: [Ansible task template](./ansible/win-winrm.j2).

The module is resolved from `configs/win-winrm/` in the configured `config_dir`.

## Requirements

- A Windows image supporting the `win_feature: name=WinRM` request and administrator privileges.
- A working backend management connection already configured on the image. Validate feature availability for the selected Windows image.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-winrm").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
Get-Service WinRM
winrm enumerate winrm/config/listener
```

WinRM is Running. Confirm that the listeners required by your backend were configured separately.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
