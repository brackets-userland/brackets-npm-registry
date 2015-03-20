/*eslint no-console:0,no-undefined:0*/
(function () {
  'use strict';

  const _ = require('lodash');
  const which = require('which');
  const buffspawn = require('buffered-spawn');
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

    buffspawn(nodePath, args, {
      cwd: __dirname
    }).progress(function (buff) {
      if (progressCallback) { progressCallback(buff.toString()); }
    }).spread(function (stdout) {
      callback(undefined, stdout);
    }, function (err) {
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

  };

}());
