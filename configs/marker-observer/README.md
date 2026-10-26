# Optional Linux marker observer

Attach `config("marker-observer")` to each Linux host prepared for the thesis
marker protocol. Provision before sealing and taking the reset baseline.
Existing guests are not updated just by pulling this repository.

Supply these trusted Ansible variables (for example with `--extra-vars
@/root/marker-observer.yml` when provisioning):

```yaml
cradle_marker_observer_public_key: 'ssh-ed25519 <controller-public-key>'
cradle_marker_observer_source: '10.250.0.1/32'
cradle_marker_management_addresses:
  agent-entry: 10.250.0.10
  edge-router: 10.250.0.11
  public-web: 10.250.0.12
  internal-server: 10.250.0.13
```

These are examples, not discovered or approved identities. Replace every
address with the deployment's actual management addresses and the controller
source seen by the guest. The management-address keys must match Ansible's
`inventory_hostname`. Provisioning refuses missing values or a local address
that is not on the guest. No key material is generated or committed here.
Keep the private key on the controller, outside deployment/shared directories.

Preparation installs Python 3, sudo and OpenSSH on Debian/Ubuntu guests,
creates root-owned `/opt/cradle-proof` with mode 1777, and creates
`cradle-observer`. It does not write a success marker or create a snapshot.
The observer has password authentication, forwarding and terminal access
disabled. Its root-owned authorized-key file permits the selected key from
the controller source only. A forced dispatcher additionally rejects SSH
connections addressed to any guest interface except the configured management
address. This account-specific rule does not disable the scenario's ordinary
SSH service on its other interfaces.

The dispatcher accepts the webapp's existing `python3 -c <reader> <path>
<expected>` wire format, discards the supplied program, and invokes only the
installed fixed reader through sudo. The reader accepts only nonce-named
`/opt/cradle-proof/user-<32 hex>` and `/root/cradle-proof-<32 hex>` paths,
with matching nonce and canonical IP content. It uses bounded reads and
refuses symlinks, unsafe parent permissions and nonregular files. There is no
general root command or arbitrary file-read facility.

In the root-owned controller verifier mapping, use `ssh_user`:
`cradle-observer`, the controller identity file and independently pinned guest
host keys. Keep the existing UUID/MAC, management lease and scope checks.
Do not treat an unauthenticated `ssh-keyscan` result as identity verification.
Mapping remains a manual host-admin task for this freeze.

Before collection, baseline checks must return `absent` for every prepared
host/privilege pair. Then run a legitimate scripted marker write and confirm
a matching final observation. These live gates have not been established by
the unit tests or by installing this config. Guest root can change the reader,
SSH service or responses; observations remain guest-reported marker presence,
not proof of privilege, pivot path or tamper resistance.

Offline tests: `python3 -m unittest discover -s tests -v` from cradle-lib.
