#! /bin/bash

/usr/bin/sysdig -p "*%evt.num %evt.time %evt.type %evt.args %fd.name %proc.pid %proc.name %proc.cmdline %proc.ppid %proc.pname %proc.pcmdline” “proc.name!=sysdig and ((evt.dir= > and (evt.type=read or evt.type=readv or evt.type=write or evt.type=writev or evt.type=fcntl or evt.type=recvfrom or evt.type=sendto or evt.type=sendmsg or evt.type=recvmsg)) or (evt.dir = < and (evt.type=rename or evt.type=accept or evt.type=clone or evt.type=rmdir or evt.type=chmod or evt.type=execve or evt.type=pipe or evt.type=fork)) ) and (not fd.name exists or fd.name != '')" -j > /var/log/sysdig.json


#sudo sysdig -p “*%evt.num %evt.time %evt.type %evt.args %fd.name %proc.pid %proc.name %proc.cmdline %proc.ppid %proc.pname %proc.pcmdline” “proc.name!=sysdig ” -j > sysdig.json

#/usr/bin/sysdig -w /var/log/sysdig.scap
