---
title: "win-pktmon"
config: "win-pktmon"
os: "Windows"
category: "Windows — observability"
description: "Deploys and configures the PKTMON packet-capture service"
---

Deploys and configures the PKTMON packet-capture service

## Implementation

- Copies and extracts the bundled service archive under `C:\Users\vagrant`.
- Checks the `PktmonService` registry key, creates an automatic service for `pktmon-service.exe` if absent and starts it.
- The start task tolerates already-running and access-denied return codes. A successful provisioning run alone does not prove the service started.

Source: [Ansible task template](./ansible/win-pktmon.j2). Supporting [assets](./files) are required by the tasks described above.

The module is resolved from `configs/win-pktmon/` in the configured `config_dir`.

## Requirements

- A Windows guest with pktmon support, administrator/service-install privileges and the `C:\Users\vagrant` path.
- The backend must expose `files/pktmon-service.zip` through `config_asset_dir`. The controller needs the Windows unzip and service task support used by the template.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-pktmon").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
Get-Item "C:\Users\vagrant\pktmon-service.exe"
Get-Service PktmonService
pktmon status
```

The executable exists, the service is Running and pktmon reports its actual capture state.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
