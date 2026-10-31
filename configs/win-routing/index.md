---
title: "win-routing"
config: "win-routing"
os: "Windows"
category: "Networking"
description: "Generate Windows routes from the compiler's resolved instance topology."
---

Generate Windows routes from the compiler's resolved instance topology.

## Implementation

- The `.j2` file is a sentinel for the compiler's configuration-existence check and is never rendered.
- Supported backend assemblers special-case this config name and generate route tasks from the compiler's resolved per-instance route list. No static destination or gateway is stored in the module.

Source: [Ansible task template](./ansible/win-routing.j2).

The module is resolved from `configs/win-routing/` in the configured `config_dir`.

## Requirements

- A Windows instance and a backend that implements the win-routing special case.
- The scenario must define sufficient network topology for route resolution. The backend must have guest privileges to apply routes.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-routing").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
Get-NetRoute -AddressFamily IPv4 | Sort-Object DestinationPrefix
```

The guest routing table contains the destinations and next hops calculated for that instance. Compare against the compiler's Deployment IR and generated backend files.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
