define(function (require, exports) {
  'use strict';

  const _ = brackets.getModule('thirdparty/lodash');
  const ExtensionManager = brackets.getModule('extensibility/ExtensionManager');
  const { coroutine: co } = require('bluebird');
  const Promise = require('bluebird');
  const semver = require('semver');
  const NpmDomain = require('../npm-domain');
  const Logger = require('../utils/logger');
  const registryUrl = 'https://brackets-npm-registry.herokuapp.com/registry';
  const progressDialog = require('./react-components/progress-dialog');
  const Utils = require('../utils/index');
  let getRegistryPromise = null;

  let _markUpdateAvailable = function (npmRegistry) {
    // get installed extenions
    let installedExtensions = _.filter(ExtensionManager.extensions,
      ext => ext && ext.installInfo && ext.installInfo.locationType === 'user')
      .map(obj => obj.installInfo.metadata);

    installedExtensions.forEach(insExt => {
      let npmInfo = _.find(npmRegistry, npmExt => npmExt.name === insExt.name);

      // extension was not found in the npm
      if (!npmInfo) { return; }

      npmInfo._currentlyInstalled = true;
      npmInfo._updateAvailable = semver.gt(npmInfo.version, insExt.version);
    });
  };

  let _getRegistry = function () {
    return Promise.resolve($.get(registryUrl))
      .catch(function (err) {
        Logger.error(err);
        // error downloading? heroku isn't 100% stable, we try to build our own
        return Promise.resolve(NpmDomain.exec('buildRegistry')
          // TODO: only log progress in DEBUG mode
          .progress(msg => Logger.log(`buildRegistry progress => ${msg}`)));
      })
      .then(response => {
        return typeof response === 'string' ? JSON.parse(response) : response;
      })
      .then(npmRegistry => {
        _markUpdateAvailable(npmRegistry);
        return npmRegistry;
      });
  };

  const getRegistry = () => getRegistryPromise || (getRegistryPromise = _getRegistry());

  const checkUpdates = co(function* () {
    let npmRegistry = yield exports.getRegistry();
    return npmRegistry.filter(extInfo => extInfo._updateAvailable === true).length > 0;
  });

  const install = function (extensionName) {
    let targetFolder = brackets.app.getApplicationSupportDirectory() + '/extensions/user';

    Logger.log(`installing ${extensionName} into ${targetFolder}`);

    let p = Promise.resolve(NpmDomain.exec('installExtension',
                                           targetFolder,
                                           extensionName));

    progressDialog.show(p);

    p.then(() => {
      Logger.log(`${extensionName} successfully installed`);
    }).catch(err => {
      Logger.log(`${extensionName} failed to install:\n`, Utils.errToString(err));
    });

  };

  exports.getRegistry = getRegistry;
  exports.checkUpdates = checkUpdates;
  exports.install = install;

});
