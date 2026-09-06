#!/bin/bash

mkdir -p "/home/vagrant/network"

while true; do
    TIMESTAMP=$(date +"%s")

    # Save to new pcap file after every 30 seconds
    timeout 30 tcpdump -i any -tttt -nn -w "/home/vagrant/capture.pcap"

   mv "/home/vagrant/capture.pcap" "/home/vagrant/network/capture_${TIMESTAMP}.pcap"

done

