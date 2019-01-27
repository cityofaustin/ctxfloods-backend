CURRENT_DIR=`dirname $BASH_SOURCE`

source $CURRENT_DIR/local.sh

# Don't display all query logs during Travis tests
export DISABLE_QUERY_LOG=true
