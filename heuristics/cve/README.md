# CVE Heuristics

This directory contains vulnerability heuristics mapped to Common Vulnerabilities and Exposures (CVE) identifiers. These heuristics stand up vulnerable environments or pin systems to vulnerable states for testing and detection validation.

## Available CVE Modules

| Module | Description | Type | Exposes |
|--------|-------------|------|---------|
| [`CVE-2021-41773`](./CVE-2021-41773) | Apache HTTP Server 2.4.49 path traversal and RCE | Docker Container | Port `8041` |
| [`CVE-2021-42013`](./CVE-2021-42013) | Apache HTTP Server 2.4.50 path traversal and RCE (incomplete fix for CVE-2021-41773) | Docker Container | Port `8043` |
| [`CVE-2021-44228`](./CVE-2021-44228) | Log4Shell (Apache Log4j2 JNDI RCE) demo application | Docker Container | Port `8042` |
| [`CVE-2024-1086`](./CVE-2024-1086) | Linux kernel netfilter (nf_tables) use-after-free LPE | Version-gated Kernel Pin | N/A |

## Usage

In instance definitions:

```text
heuristic("cve", "<cve-id>")
```

To fetch via CLI:

```bash
cxc heuristics pull cve <cve-id>
```
