# TTP Heuristics

This directory contains heuristic modules representing adversary Tactics, Techniques, and Procedures (TTPs) mapped to the MITRE ATT&CK framework.

## Available TTP Modules

| Module | ATT&CK Name | Tactic | Description |
|--------|-------------|--------|-------------|
| [`T1053.003`](./T1053.003) | Scheduled Task/Job: Cron | Persistence, Execution | Installs a persistence beacon script and recurring root cron job |
| [`T1105`](./T1105) | Ingress Tool Transfer | Command and Control | Simulates downloading external adversary tooling onto the host |

## Usage

In instance definitions:

```text
heuristic("ttp", "<technique-id>")
```

Each module carries a `manifest.json`. These techniques have no specific OS
requirement (`"os": null`), so an instance must declare `os()` explicitly (or
combine the TTP with a CVE heuristic that implies one).
