#!/bin/bash

wait-for-it -t 0 localhost:3001

npm run test-e2e-ci test/cases -c --color -S -s chrome/screenshots