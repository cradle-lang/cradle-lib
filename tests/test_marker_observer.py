"""Protocol and real filesystem edge cases without provisioning a host."""
import importlib.util
import os
from pathlib import Path
import shlex
import stat
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

FILES = Path(__file__).resolve().parents[1] / 'configs/marker-observer/files'


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, FILES / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


reader = load('marker_reader', 'marker-reader.py')
login = load('observer_login', 'observer-login.py')
NONCE = 'a' * 32
MARKER = f'/opt/cradle-proof/user-{NONCE}'
EXPECTED = f'CRADLE:{NONCE}:10.60.0.2'


class ObserverProtocol(unittest.TestCase):
    def test_dispatch_discards_code_and_never_runs_a_supplied_program(self):
        supplied = 'import os; os.system("touch /tmp/must-not-run")'
        command = shlex.join(['python3', '-c', supplied, MARKER, EXPECTED])
        self.assertEqual(login.request(command, '10.250.0.1 50000 10.250.0.2 22', '10.250.0.2'), [MARKER, EXPECTED])

    def test_other_interfaces_and_shell_operations_are_refused(self):
        for command in ['sh', 'python3 -c x /etc/shadow x; id', 'sftp', 'x' * 16385]:
            with self.subTest(command=command[:50]), self.assertRaises(ValueError):
                login.request(command, '10.250.0.1 50000 10.250.0.2 22', '10.250.0.2')
        command = shlex.join(['python3', '-c', 'ignored', MARKER, EXPECTED])
        with self.assertRaises(ValueError):
            login.request(command, '10.60.0.1 50000 10.60.0.2 22', '10.250.0.2')

    def test_reader_rejects_arbitrary_paths_nonce_mismatch_and_injection(self):
        for path, expected in [('/etc/shadow', EXPECTED), (MARKER + '/../../etc/passwd', EXPECTED),
                               (MARKER, f'CRADLE:{"b" * 32}:10.60.0.2'), (MARKER, EXPECTED + '; id')]:
            with self.subTest(path=path), self.assertRaises(ValueError):
                reader.read_marker(path, expected)


class MarkerFilesystem(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.parent = self.root / 'opt/cradle-proof'
        self.parent.mkdir(parents=True)
        self.parent.chmod(0o1777)
        self.leaf = self.parent / f'user-{NONCE}'
        original_open, original_stat = os.open, os.fstat

        def open_guest(path, *args, **kwargs):
            return original_open(str(self.root) if path == '/' else path, *args, **kwargs)

        def guest_stat(fd):
            info = original_stat(fd)
            if stat.S_ISDIR(info.st_mode):
                return SimpleNamespace(st_uid=0, st_mode=info.st_mode)
            return info

        self.patches = [patch.object(reader.os, 'open', open_guest), patch.object(reader.os, 'fstat', guest_stat)]
        for p in self.patches:
            p.start()

    def tearDown(self):
        for p in reversed(self.patches):
            p.stop()
        self.temporary.cleanup()

    def test_absence_and_fresh_content(self):
        self.assertEqual(reader.read_marker(MARKER, EXPECTED), {'outcome': 'absent'})
        self.leaf.write_text(EXPECTED + '\n')
        self.assertEqual(reader.read_marker(MARKER, EXPECTED)['outcome'], 'present')
        self.leaf.write_text('printed success is not the marker')
        self.assertEqual(reader.read_marker(MARKER, EXPECTED)['outcome'], 'mismatch')

    def test_large_files_and_fifo_are_not_read(self):
        self.leaf.write_text('x' * 1025)
        self.assertEqual(reader.read_marker(MARKER, EXPECTED)['outcome'], 'mismatch')
        self.leaf.unlink()
        os.mkfifo(self.leaf)
        self.assertEqual(reader.read_marker(MARKER, EXPECTED)['outcome'], 'mismatch')

    def test_leaf_and_parent_symlinks_are_refused(self):
        target = self.root / 'private'
        target.write_text(EXPECTED)
        self.leaf.symlink_to(target)
        with self.assertRaises(OSError):
            reader.read_marker(MARKER, EXPECTED)
        self.leaf.unlink()
        self.parent.rmdir()
        self.parent.symlink_to(self.root)
        with self.assertRaises(OSError):
            reader.read_marker(MARKER, EXPECTED)

    def test_unsafe_parent_is_unavailable(self):
        self.parent.chmod(0o0777)
        with self.assertRaises(ValueError):
            reader.read_marker(MARKER, EXPECTED)

    def test_root_path_is_bounded_and_unsafe_root_permissions_are_refused(self):
        root = self.root / 'root'
        root.mkdir(mode=0o700)
        leaf = root / f'cradle-proof-{NONCE}'
        leaf.write_text(EXPECTED)
        path = f'/root/cradle-proof-{NONCE}'
        self.assertEqual(reader.read_marker(path, EXPECTED)['outcome'], 'present')
        root.chmod(0o770)
        with self.assertRaises(ValueError):
            reader.read_marker(path, EXPECTED)


if __name__ == '__main__':
    unittest.main()
