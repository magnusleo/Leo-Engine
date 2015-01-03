#! /bin/bash

mkdir -p tmp
cd src/
coffee -c *.coffee
coffee -c **/*.coffee
../node_modules/browserify-graph/browserify-graph main.js | sed 's/.js//g' > ../tmp/graph.txt
find *.coffee | sed s/.coffee/.js/g | xargs rm
find **/*.coffee | sed s/.coffee/.js/g | xargs rm
