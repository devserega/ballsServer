@echo off
SET TARGETMACHINE_1=SEREGA-I3
echo current computer name is %COMPUTERNAME%
echo allow name is %TARGETMACHINE_1%

IF %COMPUTERNAME%==%TARGETMACHINE_1% (goto FoundName) ELSE (goto Error)

:FoundName
rem git config --global credential.helper cache
git config --global user.name "dsserega"
git config --global user.email "dsserega@gmail.com"
git add .
git commit -a -m "update"
git push origin master
Goto End

:Error
echo machine name not found

:End
exit