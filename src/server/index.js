/*eslint strict:0, no-console:0, no-process-env:0*/
'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const buffspawn = require('buffered-spawn');
const nodeEnsure = require('../node/node-ensure');
const app = express();
const registryFilePath = path.resolve(__dirname, '../../tmp/registry.json');
const logger = function (...args) { console.log(...args); };

const buildRegistry = function () {
  nodeEnsure().then(nodePath => {

    logger('going to build a registry.json file to', registryFilePath);

    let args = ['../node/registry-builder.js', registryFilePath];

    return buffspawn(nodePath, args, {
      cwd: __dirname
    }).progress(function (buff) {
      logger('buildRegistry progress =>', buff.toString());
    }).then(function () {
      logger('registry file built at', registryFilePath);
    });

  }).catch(err => {
    logger('failed to build a registry at', registryFilePath);
    logger(err.name, ':', err.message, '\n', err.stack);
  });
};

app.set('port', process.env.PORT || 5000);

app.get('/registry', function (request, response, next) {
  fs.readFile(registryFilePath, {encoding: 'utf8'}, function (err, str) {
    if (err) {
      return next(err);
    }
    try {
      response.send(JSON.parse(str));
    } catch (err2) {
      next(err2);
    }
  });
});

app.get('/', function (request, response) {
  response.send('Hello World!');
});

app.listen(app.get('port'), function () {
  logger(`Node app is running at localhost:${app.get('port')}`);
  // call on startup
  setTimeout(buildRegistry, 1);
  // and then every 30 minutes
  setInterval(buildRegistry, 30 * 60000);
});
