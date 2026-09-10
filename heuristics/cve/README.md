# CVE Heuristics

vulnerability heuristics mapped to Common Vulnerabilities and Exposures
(CVE) identifiers. These stand up vulnerable environments or pin systems to
vulnerable states for testing and detection validation. Each module carries
a `manifest.json` declaring its implied `os()`/`config()` requirements.

## Available CVE Modules

| Module | Description | Deployment | Exposes |
|--------|-------------|------------|---------|
| [`CVE-2021-41773-native`](./CVE-2021-41773-native) | Apache HTTP Server 2.4.49 path traversal and file disclosure | Native build + systemd service | Port `8080` |
| [`CVE-2021-42013-native`](./CVE-2021-42013-native) | Apache HTTP Server 2.4.50 path traversal (incomplete fix for CVE-2021-41773) | Native build + systemd service | Port `8080` |
| [`CVE-2021-44228`](./CVE-2021-44228) | Log4Shell (Apache Log4j2 JNDI RCE) demo application | Docker container | Port `8042` |
| [`CVE-2024-1086`](./CVE-2024-1086) | Linux kernel netfilter (nf_tables) use-after-free LPE | Version-gated kernel pin | N/A |

The non-native (Docker-based) `CVE-2021-41773` / `CVE-2021-42013` modules
were removed in favour of the native variants; only the `-native` modules
are maintained for these two CVEs.

## Usage

In instance definitions:

```text
heuristic("cve", "CVE-2021-41773-native")
```

If `os()` or the required `config()`s are omitted, cxc fills them in from
the module's `manifest.json` (or the packaged heuristics DB).
