# CVE Heuristics

vulnerability heuristics mapped to Common Vulnerabilities and Exposures
(CVE) identifiers. These stand up vulnerable environments or pin systems to
vulnerable states for testing and detection validation. Each module carries
a `manifest.json` declaring its implied `os()`/`config()` requirements.

## Available CVE Modules

| Module | Description | Deployment | Exposes |
|--------|-------------|------------|---------|
| [`CVE-2021-41773`](./CVE-2021-41773) | Apache HTTP Server 2.4.49 path traversal and file disclosure | Native build + systemd service | Port `8080` |
| [`CVE-2021-42013`](./CVE-2021-42013) | Apache HTTP Server 2.4.50 path traversal (incomplete fix for CVE-2021-41773) | Native build + systemd service | Port `8080` |
| [`CVE-2021-44228`](./CVE-2021-44228) | Log4Shell (Apache Log4j2 JNDI RCE) demo application | Docker container | Port `8042` |
| [`CVE-2024-1086`](./CVE-2024-1086) | Linux kernel netfilter (nf_tables) use-after-free LPE | Version-gated kernel pin | N/A |
| [`CVE-2021-4034`](./CVE-2021-4034) | PwnKit (`pkexec`) local privilege escalation | Pinned vulnerable package + built PoC | N/A |
| [`CVE-2021-3156`](./CVE-2021-3156) | Baron Samedit (`sudo`/`sudoedit` heap overflow) | Pinned vulnerable package + staged PoC | N/A |
| [`CVE-2022-0847`](./CVE-2022-0847) | Dirty Pipe (Linux kernel page-cache write) | Version-gated kernel pin + built PoC | N/A |

The earlier Docker-based `CVE-2021-41773` / `CVE-2021-42013` modules were
removed; these two CVEs are maintained only as native builds under their
plain CVE ids.

## Usage

In instance definitions:

```text
heuristic("cve", "CVE-2021-41773")
```

If `os()` or the required `config()`s are omitted, cxc fills them in from
the module's `manifest.json` (or the packaged heuristics DB).
