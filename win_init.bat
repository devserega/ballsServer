@echo off
SET TARGETMACHINE_1=SEREGA-I3
echo current computer name is %COMPUTERNAME%
echo allow name is %TARGETMACHINE_1%

IF %COMPUTERNAME%==%TARGETMACHINE_1% (goto FoundName) ELSE (goto Error)

:FoundName
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/dsserega/ballsServer.git
git push -u origin master
pause
Goto End

:Error
echo machine name not found

:End
exit

