/*eslint no-console:0,no-undefined:0*/
(function () {
  'use strict';

  const Bluebird = require('bluebird');
  const which = Bluebird.promisify(require('which'));
  const buffspawn = require('buffered-spawn');
  const RegistryBuilder = require('./registry-builder');
  const domainName = 'brackets-npm-registry-domain';
  const log = function (...args) { console.log(`[${domainName}]\n`, ...args); };
  const commonNodeLocations = process.platform === 'win32' ? [
    // TODO: windows paths
  ] : [
    '/usr/bin/node',
    '/usr/local/bin/node'
  ];
  let domainManager = null;
  let nodeIsInPath = false;
  let nodePath = null;
  let initFinished = false;

  const foundNodeAt = function (path) {
    log('found node at:\n', path);
    nodePath = path;
    initFinished = true;
  };

  const lookForNodeElsewhere = function () {
    log('looking for node in common locations:\n', commonNodeLocations.join(', '));
    // FUTURE: maybe check if stdout is a valid node version?
    Bluebird.any(commonNodeLocations.map(
      path => which(path).then(
      path => buffspawn(path, ['--version']).spread(
      (/*stdout, stderr*/) => path))
    )).then(path => {
      foundNodeAt(path);
    }).catch(errs => {
      // .any returns errs array
      errs.forEach(err => {
        log('failed to find node in common locations:\n', err.name, ':', err.message);
      });
    });
  };

  const lookForNodeInPath = function () {
    which('node')
      .then(cmd => {
        if (!cmd) {
          log('couldnt find node in system path');
          lookForNodeElsewhere();
          return;
        }
        // all good as it should be
        nodeIsInPath = true;
        nodePath = cmd;
        initFinished = true;
      })
      .catch(err => {
        log('error looking for node in system path:\n', err.name, ':', err.message);
        lookForNodeElsewhere();
      });
  };

  // init the domain internals
  lookForNodeInPath();

  const buildRegistry = function (callback) {
    // TODO: delegate this to buffspawn, so memory is properly released after it finishes
    RegistryBuilder.buildRegistry().nodeify(callback);
  };

  const installExtension = function (targetPath, name, callback, progressCallback) {

    let args = ['extension-installer.js', targetPath, name];

    let env = process.env;
    // TODO: fix nodePath into the parent dir path
    env.PATH = ['/usr/local/bin', env.PATH].join(':');

    // TODO: what if nodePath is null?
    buffspawn(nodePath, args, {
      cwd: __dirname,
      env
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
