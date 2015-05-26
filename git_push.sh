#!/bin/sh
git add .
git commit -a -m "update"
git remote add origin git@github.com:dsserega/ballsServer.git
git push -u origin master