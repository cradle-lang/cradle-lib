#!/usr/bin/python3 -I
"""Forced SSH command: accept the existing controller wire format, not code."""
import ipaddress
import json
import os
import shlex
import sys


def request(original, connection, management_address):
    if len(original) > 16384:
        raise ValueError("oversized request")
    parts = connection.split()
    if len(parts) != 4 or ipaddress.ip_address(parts[2]) != ipaddress.ip_address(management_address):
        raise ValueError("observer must connect to the management address")
    tokens = shlex.split(original)
    if len(tokens) != 5 or tokens[:2] != ["python3", "-c"]:
        raise ValueError("unsupported protocol")
    # tokens[2] is the controller's legacy reader source. It is deliberately
    # discarded; only the installed fixed reader runs, with validated arguments.
    return tokens[3:]


if __name__ == "__main__":
    try:
        with open("/etc/cradle-marker-observer.json") as stream:
            config = json.load(stream)
        args = request(os.environ.get("SSH_ORIGINAL_COMMAND", ""), os.environ.get("SSH_CONNECTION", ""), config["management_address"])
        os.execv("/usr/bin/sudo", ["sudo", "-n", "/usr/local/libexec/cradle-marker-reader", *args])
    except Exception:
        sys.exit(1)
