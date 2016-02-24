/*eslint no-console:0,no-undefined:0,no-process-env:0*/
(function () {
  'use strict';

  const domainName = 'brackets-npm-registry-domain';
  const buffspawn = require('buffered-spawn');
  const nodeEnsure = require('./node-ensure');
  const { promisifyAll } = require('bluebird');
  const fs = promisifyAll(require('fs-extra'));
  const path = require('path');
  const utils = require('./utils');
  let domainManager = null;

  const buildRegistry = function (callback, progressCallback) {
    nodeEnsure().then(nodePath => {

      let args = ['registry-builder.js'];

      return buffspawn(nodePath, args, {
        cwd: __dirname,
        env: utils.processEnvWithPath(path.dirname(nodePath))
      }).progress(function (buff) {
        if (progressCallback && buff.type === 'stderr') {
          progressCallback(buff.toString());
        }
      }).spread(function (stdout) {
        callback(undefined, stdout);
      });

    }).catch(err => callback(err));
  };

  const installExtension = function (targetPath, name, callback, progressCallback) {
    nodeEnsure().then(nodePath => {

      // brackets currently don't have progress callback
      // blocked by https://github.com/adobe/brackets/pull/10761
      let progressBuffer = [];
      if (!progressCallback) {
        progressCallback = str => progressBuffer.push(str);
      }

      let finishWithBuffer = stdout => {
        if (progressBuffer.length > 0) {
          stdout = progressBuffer.concat(stdout).join('\n');
        }
        callback(undefined, stdout);
      };

      // self-update is special, we don't want to go this way for every extension
      // extensionInstaller takes a lot of node memory by loading npm
      // so we go around this by spawning it as a separate process
      // but this doesn't work well when self-updating
      if (name === 'brackets-npm-registry') {
        return require('./extension-installer')
          .install(targetPath, name, {
            output: (...args) => progressCallback(args.join(' ')),
            progress: (...args) => progressCallback(args.join(' '))
          })
          .then(stdout => finishWithBuffer(stdout))
          .catch(err => callback(err));
      }

      return buffspawn(nodePath, ['extension-installer.js', targetPath, name], {
        cwd: __dirname,
        env: utils.processEnvWithPath(path.dirname(nodePath))
      }).progress(buff => {
        if (buff.type === 'stderr') {
          progressCallback(buff.toString());
        }
      }).spread(stdout => finishWithBuffer(stdout));

    }).catch(err => callback(err.stack ? err.stack : err.toString()));
  };

  const removeExtension = function (targetPath, name, callback, progressCallback) {

    if (progressCallback) {
      progressCallback(`removing ${name} from ${targetPath}`);
    }

    fs.removeAsync(path.resolve(targetPath, name))
      .then(function () {
        callback(undefined, `successfully removed ${name}`);
      })
      .catch(err => {
        callback(err);
      });

  };

  exports.init = function (_domainManager) {
    domainManager = _domainManager;

    if (!domainManager.hasDomain(domainName)) {
      domainManager.registerDomain(domainName, {major: 0, minor: 1});
    }

    domainManager.registerCommand(
      domainName,
      'buildRegistry', // command name
      buildRegistry, // handler function
      true, // is async
      'get a list of extensions from npm', // description
      [
        {name: 'extensions', type: 'array'}
      ]
    );

    domainManager.registerCommand(
      domainName,
      'installExtension',
      installExtension,
      true,
      'installs an extension into a given path',
      [
        {name: 'targetPath', type: 'string'},
        {name: 'extensionName', type: 'string'},
        {name: 'installLog', type: 'string'}
      ]
    );

    domainManager.registerCommand(
      domainName,
      'removeExtension',
      removeExtension,
      true,
      'removes an extension from a given path',
      [
        {name: 'targetPath', type: 'string'},
        {name: 'extensionName', type: 'string'},
        {name: 'installLog', type: 'string'}
      ]
    );

  };

}());
