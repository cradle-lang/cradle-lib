---
title: "win-icmpv4"
config: "win-icmpv4"
os: "Windows"
category: "Windows — system & network"
description: "Allows inbound ICMPv4 (ping)"
---

Allows inbound ICMPv4 (ping)

## Implementation

- Creates an enabled inbound ICMPv4 allow rule named `Allow incoming ICMP echo request`.

Source: [Ansible task template](./ansible/win-icmpv4.j2).

The module is resolved from `configs/win-icmpv4/` in the configured `config_dir`.

## Requirements

- A Windows guest with administrator privileges and Windows Firewall.
- The controller needs `community.windows.win_firewall_rule`. External network rules must also permit the intended traffic.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-icmpv4").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
Get-NetFirewallRule -DisplayName "Allow incoming ICMP echo request" | Select-Object DisplayName,Enabled,Direction,Action
```

The rule is enabled, inbound and set to Allow.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
