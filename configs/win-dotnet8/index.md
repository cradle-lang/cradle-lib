---
title: "win-dotnet8"
config: "win-dotnet8"
os: "Windows"
category: "Windows — tooling"
description: "Installs the .NET 8 SDK"
---

Installs the .NET 8 SDK

## Implementation

- Creates `C:\Temp`, downloads the x64 .NET SDK 8.0.100 installer and runs it with `/quiet /norestart`.
- The template installs the SDK, not only the runtime.

Source: [Ansible task template](./ansible/win-dotnet8.j2).

The module is resolved from `configs/win-dotnet8/` in the configured `config_dir`.

## Requirements

- An x64 Windows guest supported by the .NET 8 installer, administrator privileges and HTTPS access to dotnetcli.azureedge.net.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-dotnet8").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
& "C:\Program Files\dotnet\dotnet.exe" --list-sdks
```

The SDK list includes 8.0.100.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
