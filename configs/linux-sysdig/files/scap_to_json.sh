#!/bin/bash

if [ $# -ne 2 ]; then
    echo "This script requires 2 arguments"


sudo sysdig -p “*%evt.num %evt.time %evt.type %evt.args %fd.name %proc.pid %proc.name %proc.cmdline %proc.ppid %proc.pname %proc.pcmdline” “proc.name!=sysdig ” -j > anomaly.json
