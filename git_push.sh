#!/bin/sh
git add .
git commit -a -m "update"
git config –-global user.name dsserega
git config user.name dsserega
git remote add origin https://github.com/dsserega/ballsServer.git
git push -u origin master