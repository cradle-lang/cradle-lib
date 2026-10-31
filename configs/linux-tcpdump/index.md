---
title: "linux-tcpdump"
config: "linux-tcpdump"
os: "Linux"
category: "Linux — observability"
description: "Installs tcpdump plus a bundled capture script and service"
---

Installs tcpdump plus a bundled capture script and service

## Implementation

- Installs the bundled capture script and systemd unit, then starts/enables tcpdump.service.
- Replaces `/home/<user>` paths in the script with the backend's `linux_guest_home_dir` value.
- The script captures all interfaces into 30-second pcap segments under the selected home directory's `network/` folder. It does not install the tcpdump executable.

Source: [Ansible task template](./ansible/linux-tcpdump.j2). Supporting [assets](./files) are required by the tasks described above.

The module is resolved from `configs/linux-tcpdump/` in the configured `config_dir`.

## Requirements

- A Linux guest with systemd, bash, tcpdump, GNU timeout and administrator privileges.
- The backend must supply `linux_guest_home_dir` and expose the bundled script and service through `config_asset_dir`. Ensure the capture path has space available.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-tcpdump").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
command -v tcpdump timeout
systemctl is-active tcpdump
sudo systemctl cat tcpdump
sudo grep -n network /etc/systemd/system/linux_tcpdump.sh
```

The tools exist and the service is active. After at least 30 seconds, check the resolved home directory's network folder for capture_<timestamp>.pcap segments.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](./). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
