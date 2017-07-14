#!/bin/bash

find src/js/ -name '*.js' -exec cat {} \; > webroot/static/js/scf.js
