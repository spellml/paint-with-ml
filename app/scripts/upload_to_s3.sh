#! /bin/bash
# Replace s3://paintwithml.spell.ml/ with your target bucket name
set -e
pushd ../ && PAINT_WITH_ML_HOME=$PWD && popd
aws s3 cp --acl public-read \
    $PAINT_WITH_ML_HOME/index.html \
    s3://paintwithml.spell.ml/index.html
aws s3 sync --acl public-read \
    $PAINT_WITH_ML_HOME/static/ \
    s3://paintwithml.spell.ml/static/