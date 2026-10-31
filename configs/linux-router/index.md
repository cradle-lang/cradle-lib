---
title: Linux routing
config: linux-router
description: Enable IP forwarding so a Linux instance can route traffic between attached networks.
os: Linux
category: Networking
---

Enable IP forwarding so a Linux instance can route traffic between attached networks.

## Implementation

- Sets `net.ipv4.ip_forward=1` using sysctl.
- Ensures a NAT POSTROUTING rule returns locally originated traffic before adding a MASQUERADE rule. This preserves the router's own source addresses while enabling NAT for forwarded traffic.
- This module enables forwarding and NAT; route entries are provided separately by the scenario/backend.

Source: [Ansible task template](./ansible/linux-router.j2).

The module is resolved from `configs/linux-router/` in the configured `config_dir`.

## Requirements

- A Linux guest with administrator privileges, sysctl and iptables. The template does not install iptables.
- A backend/controller with the Ansible sysctl and iptables modules used by the template, and a guest that permits changing its network namespace rules.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-router").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
sysctl net.ipv4.ip_forward
sudo iptables -t nat -S POSTROUTING
ip route
```

IP forwarding is 1. The local-source RETURN exemption precedes the MASQUERADE rule. Routes should match the scenario topology.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
