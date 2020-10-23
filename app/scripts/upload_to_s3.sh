#! /bin/bash
# Replace s3://paintwith.spell.ml/ with your target bucket name
set -e
pushd ../ && PAINT_WITH_ML_HOME=$PWD && popd
aws s3 cp --acl public-read \
    $PAINT_WITH_ML_HOME/index.html \
    s3://paintwith.spell.ml/index.html
aws s3 sync --acl public-read \
    $PAINT_WITH_ML_HOME/static/ \
    s3://paintwith.spell.ml/static/
aws s3 cp --acl public-read \
    $PAINT_WITH_ML_HOME/robots.txt \
    s3://paintwith.spell.ml/robots.txt