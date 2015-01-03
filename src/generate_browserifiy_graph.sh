#! /bin/bash

coffee -c *.coffee
../node_modules/browserify-graph/browserify-graph main.js | sed 's/.js//g' > graph.txt
find *.coffee | sed s/.coffee/.js/g | xargs rm 
