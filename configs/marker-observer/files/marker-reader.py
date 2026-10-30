#!/usr/bin/python3 -I
"""Fixed read-only marker protocol. Never evaluate a supplied program/path."""
import ipaddress
import json
import os
import re
import stat
import sys


def read_marker(path, expected):
    match = re.fullmatch(r"(?:/opt/cradle-proof/user-|/root/cradle-proof-)([a-f0-9]{32})", path)
    if not match or not expected.startswith(f"CRADLE:{match[1]}:"):
        raise ValueError("invalid marker request")
    host = expected.split(":", 2)[2]
    if str(ipaddress.ip_address(host)) != host:
        raise ValueError("noncanonical host")
    parts = path.strip("/").split("/")
    fd = os.open("/", os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in parts[:-1]:
            nxt = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = nxt
        parent = os.fstat(fd)
        mode = stat.S_IMODE(parent.st_mode)
        if parent.st_uid != 0 or (parts[0] == "opt" and mode != 0o1777) or (parts[0] == "root" and mode & 0o022):
            raise ValueError("unprepared parent")
        try:
            leaf = os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
        except FileNotFoundError:
            return {"outcome": "absent"}
        try:
            info = os.fstat(leaf)
            if not stat.S_ISREG(info.st_mode) or info.st_size > 1024:
                return {"outcome": "mismatch"}
            data = os.read(leaf, 1025)
            return {"outcome": "present" if data in (expected.encode(), (expected + "\n").encode()) else "mismatch",
                    "reported_uid": info.st_uid, "reported_mode": stat.S_IMODE(info.st_mode)}
        finally:
            os.close(leaf)
    finally:
        os.close(fd)


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("expected two arguments")
        print(json.dumps(read_marker(*sys.argv[1:])))
    except Exception:
        # Guest diagnostics never become evidence or arbitrary file contents.
        sys.exit(1)
