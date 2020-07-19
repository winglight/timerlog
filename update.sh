#!/usr/bin/env bash
git pull

pm2 stop index

pm2 start src/index.js