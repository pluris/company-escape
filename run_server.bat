@echo off
cd /d %~dp0
title Betta Game Server (8123)
python -m http.server 8123 --bind 127.0.0.1
