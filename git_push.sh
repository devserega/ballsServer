#!/bin/sh
git add .
git commit -a -m "update"
git config –-global user.email "dsserega@gmail.com"
git config --global user.name "dsserega"
git remote add origin https://dsserega@github.com/dsserega/ballsServer.git
git push -u origin master