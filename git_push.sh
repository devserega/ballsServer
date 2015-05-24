#!/bin/sh
rem git config --global credential.helper cache
git config --global user.name "dsserega"
git config --global user.email "dsserega@gmail.com"
git add .
git commit -a -m "update"
git push origin master