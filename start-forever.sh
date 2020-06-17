#!/bin/bash
cd /var/www/html/www.aslbiblebot.com/
NODE_ENV=production /usr/local/bin/forever start --spinSleepTime 10000 --minUptime 10000 index.js
