CURRENT_DIR=`dirname $BASH_SOURCE`

source $CURRENT_DIR/local.sh
export DISABLE_QUERY_LOG=true

# Travis postgres v10 runs on port 5433
if [[ $TRAVIS = true ]];then
  export PG_PORT=5433
fi
