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
const utils = require('../node/utils');

let registryJson;
let buildRegistry;
let buildRegistryInterval;

const scheduleBuild = function () {
  // call now
  setTimeout(buildRegistry, 1);
  // clear current interval
  clearInterval(buildRegistryInterval);
  // and then every 30 minutes
  buildRegistryInterval = setInterval(buildRegistry, 30 * 60000);
};

buildRegistry = function () {
  nodeEnsure().then(nodePath => {

    logger('going to build a registry.json file to', registryFilePath);

    let args = ['../node/registry-builder.js', registryFilePath];

    return buffspawn(nodePath, args, {
      cwd: __dirname,
      env: utils.processEnvWithPath(path.dirname(nodePath))
    }).progress(function (buff) {
      if (buff.type === 'stderr') { logger('buildRegistry progress =>', buff.toString()); }
    }).then(function ([ stdout ]) {
      logger('registry file built at', registryFilePath);
      try {
        registryJson = JSON.parse(stdout);
        logger('parsed registryJson from stdout');
      } catch (err) {
        registryJson = null;
        logger('failed to parse registryJson from stdout: ' + err);
      }
    }).catch(function () {
      logger('failed to build registry');
      scheduleBuild();
    });

  }).catch(err => {
    logger('failed to build a registry at', registryFilePath);
    logger(err.name, ':', err.message, '\n', err.stack);
  });
};

app.set('port', process.env.PORT || 5000);

app.get('/registry', function (request, response, next) {
  if (registryJson) {
    response.send(registryJson);
    return;
  }
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
  scheduleBuild();
});
