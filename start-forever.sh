#!/bin/bash
NODE_ENV=production /usr/local/bin/forever start --spinSleepTime 10000 --minUptime 10000 /var/www/html/www.aslbiblebot.com/index.js
