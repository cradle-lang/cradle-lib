---
title: "win-power-option"
config: "win-power-option"
os: "Windows"
category: "Windows — system & network"
description: "Disables sleep and monitor timeout, keeping the instance always-on"
---

Disables sleep and monitor timeout, keeping the instance always-on

## Implementation

- Sets AC and battery display/sleep timeouts to zero and disables hibernation.
- Disables scheduled tasks whose names contain shutdown, tolerating errors in that task.
- Sets `DisableShutdownEventTracker=1` under the Windows system-policy registry key.

Source: [Ansible task template](./ansible/win-power-option.j2).

The module is resolved from `configs/win-power-option/` in the configured `config_dir`.

## Requirements

- A Windows guest with PowerShell, powercfg, scheduled-task support and administrator privileges.
- The power-setting changes affect the guest's active power plan; supported settings depend on the image and virtual hardware.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-power-option").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
powercfg /query
Get-ScheduledTask | Where-Object { $_.TaskName -like "*shutdown*" } | Select-Object TaskName,State
Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Policies\System" -Name DisableShutdownEventTracker
```

Display/standby timeouts are zero where supported, targeted shutdown tasks are disabled and the registry value is 1.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
