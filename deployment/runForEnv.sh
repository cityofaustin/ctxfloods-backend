#!/bin/bash

# -e <<ENV>> : determines which environment variables you want to apply for your script
# -s <<SCRIPT_PATH>> : the node script you want to run
# -d : flag to indicate you want the script to run as nodemon with the inspector
# ex: bash ./deployment/runForEnv.sh -s ./localServer.js -e local -d
# ex: bash ./deployment/runForEnv.sh -s ./db/scripts/initialize.js -e local

CURRENT_DIR=`dirname $BASH_SOURCE`
DEMON_FLAG=false;

while getopts ":e:s:d" opt; do
  case $opt in
    e )
      ENV=$OPTARG
      ;;
    s )
      SCRIPT_PATH=$OPTARG
      ;;
    d )
      DEMON_FLAG=true;
      ;;
    \? )
      echo "Invalid option: -$OPTARG" >&2
      exit;
      ;;
    : )
      echo "Invalid option: -$OPTARG requires an argument" 1>&2
      exit;
      ;;
  esac
done

source $CURRENT_DIR/vars/$ENV.sh

if [ $DEMON_FLAG == true ]; then
  nodemon --inspect $CURRENT_DIR/../$SCRIPT_PATH
else
  node $CURRENT_DIR/../$SCRIPT_PATH
fi
