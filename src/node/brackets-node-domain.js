/*eslint no-console:0,no-undefined:0*/
(function () {
  'use strict';

  const _ = require('lodash');
  const spawn = require('child_process').spawn;
  const which = require('which');
  const helpers = require('./domain-helpers');
  const RegistryBuilder = require('./registry-builder');
  const domainName = 'brackets-npm-registry-domain';
  let domainManager = null;

  // find a path to node
  const nodePath = _.find([
    '/usr/local/bin/node'
  ], path => which.sync(path));

  if (!nodePath) {
    console.error('[brackets-npm-registry] cant find node executable!');
  }

  const buildRegistry = function (callback) {
    // TODO: delegate this to spawn, so memory is properly released after it finishes
    RegistryBuilder.buildRegistry().nodeify(callback);
  };

  const installExtension = function (targetPath, name, callback, progressCallback) {

    let args = ['extension-installer.js', targetPath, name];

    let child = spawn(nodePath, args, {
      cwd: __dirname
    });

    let exitCode, stdout = [], stderr = [];

    child.stdout.on('data', function (data) {
      stdout[stdout.length] = data;
    });

    child.stderr.on('data', function (data) {
      if (progressCallback) { progressCallback(helpers.join(data)); }
      stderr[stderr.length] = data;
    });

    child.on('error', function (err) {
      callback(err.stack, undefined);
    });

    child.on('exit', function (code) {
      exitCode = code;
    });

    child.on('close', function () {
      callback(exitCode > 0 ? helpers.join(stderr) : undefined,
               exitCode > 0 ? undefined : helpers.join(stdout));
    });

    child.stdin.end();

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

  };

}());
