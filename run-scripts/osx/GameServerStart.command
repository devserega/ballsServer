#!/bin/bash

#get current directory
pushd . > /dev/null
SCRIPT_PATH="${BASH_SOURCE[0]}";
while([ -h "${SCRIPT_PATH}" ]); do
cd "`dirname "${SCRIPT_PATH}"`"
SCRIPT_PATH="$(readlink "`basename "${SCRIPT_PATH}"`")";
done
cd "`dirname "${SCRIPT_PATH}"`" > /dev/null
SCRIPT_PATH="`pwd`";
popd  > /dev/null
echo "srcipt=[${SCRIPT_PATH}/game-server]"
#echo "pwd   =[`pwd`]"

echo '============  start game-server ============'
pomelo start -d "${SCRIPT_PATH}/../../game-server"