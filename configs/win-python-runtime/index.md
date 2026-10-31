---
title: "win-python-runtime"
config: "win-python-runtime"
os: "Windows"
category: "Windows — tooling"
description: "Extracts a shared Python 3.10 runtime under C:\\ProgramData\\cxc"
---

## Use in a specification

```cradle
config("win-python-runtime").
```

Installs one shared Python 3.10 runtime at:

```text
C:\ProgramData\cxc\python\python.exe
```

The archive is derived from WinPython 3.10.11. Documentation, headers, import
libraries, and developer tools are removed; the Python runtime, standard
library, pip, DLLs, and Tcl/Tk runtime are retained for Railway GUI and
automation workloads.

The companion `.sha256` file is verified in the guest before extraction.
Python package dependencies are installed by separate platform-specific configs.
