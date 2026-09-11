# Config Library

This directory contains reusable provisioning modules for CradleXC (`cxc`).
Each config installs and configures one piece of software or one host
behaviour that a `.cradle` scenario can attach to an instance.

## Declaration and Usage

Configs are declared on an instance in a `.cradle` scenario:

```text
config("<config-name>")
```

The content is resolved from the configured `config_dir` (a local folder or
a git URL such as this repository).

## Directory Layout

```text
configs/
  <config>/
    ansible/
      <config>.j2   # Tera-rendered Ansible task list (required)
    files/          # optional assets referenced by the template
```

Unlike heuristics, configs carry no `manifest.json` — a config is always
exactly what's named in `config()`, with nothing implied about `os()` or
other configs. Only five configs currently ship a `files/` directory
(`linux-auditd`, `linux-sysdig`, `linux-tcpdump`, `win-pktmon`, `win-sysmon`)
— the rest install everything they need directly through the package
manager, with no extra assets to stage.

## Legacy Aliases

A handful of older config names are still accepted and transparently
resolved to their current folder:

| Legacy name | Resolves to |
|-------------|-------------|
| `ubuntu-focal-auditd` | `linux-auditd` |
| `ubuntu-focal-mail` | `linux-mail` |
| `ubuntu-focal-python3` | `linux-python3` |
| `ubuntu-focal-smb` | `linux-smb` |
| `ubuntu-focal-mysql` | `linux-mysql` |
| `ubuntu-focal-apache2` | `linux-apache2` |
| `ubuntu-focal-netcat` | `linux-netcat` |
| `ubuntu-focal-docker` | `linux-docker` |
| `win-custom-routing` | `win-routing` |

## Built-in Configs (not in this repository)

`linux-routing` and `win-routing` are handled entirely inside `cxc`'s own
assembler — they exist as configs on an instance, but there is no
`configs/linux-routing/` or `configs/win-routing/` folder here to fetch.

## Available Configs

### Linux — services & network

| Config | Description |
|--------|-------------|
| [`linux-apache2`](./linux-apache2) | Installs and starts Apache HTTP Server |
| [`linux-dns`](./linux-dns) | Installs and configures Bind9 as a DNS resolver/server |
| [`linux-docker`](./linux-docker) | Installs Docker and its dependencies |
| [`linux-mail`](./linux-mail) | Installs Bind9 and mail-related packages for a mail-server role |
| [`linux-mysql`](./linux-mysql) | Installs and starts MySQL Server |
| [`linux-netcat`](./linux-netcat) | Installs netcat |
| [`linux-nmap`](./linux-nmap) | Installs nmap |
| [`linux-ntp`](./linux-ntp) | Installs and configures Chrony as an NTP server |
| [`linux-python3`](./linux-python3) | Ensures Python 3 is installed |
| [`linux-router`](./linux-router) | Enables IP forwarding and NAT masquerade rules for a router/gateway instance |
| [`linux-smb`](./linux-smb) | Installs and configures Samba (SMB file sharing) |
| [`linux-ufw`](./linux-ufw) | Installs UFW and allows SSH |
| [`linux-unzip`](./linux-unzip) | Installs unzip |
| [`linux-vsftpd`](./linux-vsftpd) | Installs and configures vsftpd (FTP server) |
| [`net-tools`](./net-tools) | Installs the `net-tools` package (`ifconfig`, `netstat`, ...) |
| [`python3-pip`](./python3-pip) | Installs python3-pip |

### Linux — observability

| Config | Description |
|--------|-------------|
| [`linux-auditd`](./linux-auditd) | Installs auditd with a bundled custom audit rules file |
| [`linux-sysdig`](./linux-sysdig) | Installs sysdig from a vendored package release |
| [`linux-tcpdump`](./linux-tcpdump) | Installs tcpdump plus a bundled capture script and service |

### Windows — system & network

| Config | Description |
|--------|-------------|
| [`win-allow-ports`](./win-allow-ports) | Opens specific inbound firewall ports (ICMP, FTP, ...) |
| [`win-icmpv4`](./win-icmpv4) | Allows inbound ICMPv4 (ping) |
| [`win-power-option`](./win-power-option) | Disables sleep and monitor timeout, keeping the instance always-on |
| [`win-winrm`](./win-winrm) | Ensures WinRM is enabled and running |

### Windows — tooling

| Config | Description |
|--------|-------------|
| [`win-chocolatey`](./win-chocolatey) | Installs the Chocolatey package manager |
| [`win-dotnet8`](./win-dotnet8) | Installs the .NET 8 SDK |
| [`win-myl`](./win-myl) | Installs the `myl` Python package via pip |
| [`win-nodejs`](./win-nodejs) | Installs Node.js |
| [`win-pyenv`](./win-pyenv) | Installs pyenv-win and a Python version through it |
| [`win-python`](./win-python) | Installs Python via Chocolatey |
| [`win-winrar`](./win-winrar) | Installs WinRAR |

### Windows — observability

| Config | Description |
|--------|-------------|
| [`win-audit`](./win-audit) | Configures the Windows advanced audit policy (logon/logoff, ...) |
| [`win-pktmon`](./win-pktmon) | Deploys and configures the PKTMON packet-capture service |
| [`win-sysmon`](./win-sysmon) | Installs Sysmon with a bundled configuration |

### Cross-platform & decoy

| Config | Description |
|--------|-------------|
| [`benign-firefox-win`](./benign-firefox-win) | Installs Firefox on Windows |
| [`python-benign-mail-packages`](./python-benign-mail-packages) | Installs a benign set of Python mail-handling packages (Linux) |
| [`python-benign-mail-packages-win`](./python-benign-mail-packages-win) | Installs a benign set of Python mail-handling packages (Windows) |
| [`python-benign-web-packages`](./python-benign-web-packages) | Installs a benign set of Python web packages (Linux) |
| [`python-benign-web-packages-win`](./python-benign-web-packages-win) | Installs a benign set of Python web packages (Windows) |
| [`win-tellerApp`](./win-tellerApp) | Deploys a fake "FinCore Systems" banking decoy app as social-engineering/EDR bait |

### Attacker / offensive

| Config | Description |
|--------|-------------|
| [`attacker`](./attacker) | Installs a baseline attacker toolkit (nmap, netcat, curl, wget, python3/pip, Flask) |
| [`linux-msf`](./linux-msf) | Installs the Metasploit Framework |
