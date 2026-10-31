---
title: "win-allow-ports"
config: "win-allow-ports"
os: "Windows"
category: "Windows — system & network"
description: "Opens specific inbound firewall ports (ICMP, FTP, ...)"
---

Opens specific inbound firewall ports (ICMP, FTP, ...)

## Implementation

- Creates enabled inbound allow rules for ICMPv4 and TCP ports 21 (FTP), 80 (HTTP) and 443 (HTTPS).
- This module only adds firewall rules; it does not install any of the corresponding services.

Source: [Ansible task template](./ansible/win-allow-ports.j2).

The module is resolved from `configs/win-allow-ports/` in the configured `config_dir`.

## Requirements

- A Windows guest with administrator privileges and an operational Windows Firewall service.
- The controller needs `community.windows.win_firewall_rule`. Network-level rules outside the guest are configured separately.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-allow-ports").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
Get-NetFirewallRule -DisplayName "Allow incoming ICMP echo request","FTP","HTTP","HTTPS" | Select-Object DisplayName,Enabled,Direction,Action
```

The four rules are enabled, inbound and set to Allow.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
