# T1053.003: Scheduled Task/Job: Cron

## Overview

Adversaries may abuse the `cron` utility to execute malicious code on a recurring schedule or at system startup to establish persistence and maintain access to compromised Linux systems.

## Implementation Details

- **Beacon Script**: Deploys a shell script to `/usr/local/bin/cxc-cron-beacon.sh` (permissions `0755`).
  - Writes a timestamped beacon entry: `echo "beacon $(date -u +%FT%TZ)" >> /var/log/cxc-cron-beacon.log`.
- **Cron Job**: Installs a root crontab entry named `cxc-t1053-003` scheduled to execute every 5 minutes (`*/5 * * * *`).

## Structure

- [`ansible/`](./ansible): Contains the Ansible task list template (`T1053.003.j2`).

## Verification & Artifacts

- **Beacon Script**: `/usr/local/bin/cxc-cron-beacon.sh`
- **Crontab Entry**: View root crontab using `crontab -l -u root`
- **Execution Log**: Inspect `/var/log/cxc-cron-beacon.log` for periodic beacon messages
