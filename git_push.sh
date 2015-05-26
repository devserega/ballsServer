#!/bin/sh
git add .
git commit -a -m "update"
git config –-global user.email "dsserega@gmail.com"
git config --global user.name "dsserega"
#git remote rm origin
git remote add origin git@github.com:dsserega/ballsServer.git
git push -u origin master