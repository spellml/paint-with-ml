#! /bin/bash
set -e
npm run build
cd ../ && \
    git checkout -B gh-pages && \
    rm -rf * && \
    git restore --source master -- app/index.html app/static/ && \
    cp -rf app/* . && \
    rm -rf app && \
    git commit -a -m "Publish website." && \
    git push origin gh-pages