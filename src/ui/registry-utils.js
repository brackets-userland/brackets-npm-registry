define(function (require, exports, module) {
  'use strict';

  const _ = brackets.getModule('thirdparty/lodash');
  const EventEmitter = require('eventemitter');
  const ExtensionManager = brackets.getModule('extensibility/ExtensionManager');
  const Promise = require('bluebird');
  const semver = require('semver');
  const NpmDomain = require('../npm-domain');
  const Logger = require('../utils/logger');
  const registryUrl = 'https://brackets-npm-registry.herokuapp.com/registry';
  const progressDialog = require('./react-components/progress-dialog');
  const Utils = require('../utils/index');
  const toolbarIcon = require('./toolbar-icon');

  let RegistryUtils = new EventEmitter();
  let downloadRegistryPromise = null;
  let installedExtensions = null;
  let npmRegistry = null;

  let getInstalledExtensions = function () {
    if (installedExtensions) { return installedExtensions; }
    installedExtensions = _.filter(ExtensionManager.extensions,
                                   ext => ext && ext.installInfo && ext.installInfo.locationType === 'user')
                           .map(obj => obj.installInfo.metadata);
    return installedExtensions;
  };

  let registrySort = function () {
    npmRegistry.sort((a, b) => {
      let result = 0;
      // first sort by update available
      if (a._updateAvailable) { result -= 1; }
      if (b._updateAvailable) { result += 1; }
      if (result !== 0) { return result; }
      // default sort by name
      return a.sortName.localeCompare(b.sortName);
    });
  };

  let afterRegistryDownloaded = function () {
    let updatesAvailable = false;

    npmRegistry.forEach(entry => {
      entry.displayName = entry.title ? entry.title + ' (' + entry.name + ')' : entry.name;
      entry.sortName = entry.displayName.toLowerCase();
    });

    getInstalledExtensions().forEach(insExt => {
      let npmInfo = _.find(npmRegistry, npmExt => npmExt.name === insExt.name);

      // extension was not found in the npm
      if (!npmInfo) { return; }

      npmInfo._currentlyInstalled = true;
      if (npmInfo.version && insExt.version) {
        npmInfo._updateAvailable = semver.gt(npmInfo.version, insExt.version);
      } else {
        npmInfo._updateAvailable = true;
      }
      if (npmInfo._updateAvailable) { updatesAvailable = true; }
    });

    toolbarIcon.toggle(updatesAvailable);
    registrySort();
  };

  let markInstalled = function (extName) {
    let installedObj = _.find(installedExtensions, {name: extName});
    let registryObj = _.find(npmRegistry, {name: extName});

    if (!installedObj) { // install
      installedExtensions.push(registryObj);
    } else { // update/reinstall
      installedObj.version = registryObj.version;
    }

    afterRegistryDownloaded();
  };

  let markRemoved = function (extName) {
    let installedObj = _.find(installedExtensions, {name: extName});
    let registryObj = _.find(npmRegistry, {name: extName});

    installedExtensions = _.without(installedExtensions, installedObj);
    delete registryObj._currentlyInstalled;
    delete registryObj._updateAvailable;

    afterRegistryDownloaded();
  };

  let _downloadRegistry = function () {
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
      .then(_npmRegistry => {
        npmRegistry = _npmRegistry;
        afterRegistryDownloaded();
        return npmRegistry;
      });
  };

  const getRegistry = () => downloadRegistryPromise || (downloadRegistryPromise = _downloadRegistry());

  const install = function (extensionName) {
    let targetFolder = brackets.app.getApplicationSupportDirectory() + '/extensions/user';

    Logger.log(`installing ${extensionName} into ${targetFolder}`);

    let p = Promise.resolve(NpmDomain.exec('installExtension',
                                           targetFolder,
                                           extensionName));

    progressDialog.show(p);

    p.then(() => {
      markInstalled(extensionName);
      Logger.log(`${extensionName} successfully installed`);
    }).catch(err => {
      Logger.log(`${extensionName} failed to install:\n`, Utils.errToString(err));
    }).finally(() => {
      RegistryUtils.emit('change', npmRegistry);
    });

  };

  const remove = function (extensionName) {
    let targetFolder = brackets.app.getApplicationSupportDirectory() + '/extensions/user';

    Logger.log(`removing ${extensionName} from ${targetFolder}`);

    let p = Promise.resolve(NpmDomain.exec('removeExtension',
                                           targetFolder,
                                           extensionName));

    progressDialog.show(p);

    p.then(() => {
      markRemoved(extensionName);
      Logger.log(`${extensionName} successfully removed`);
    }).catch(err => {
      Logger.log(`${extensionName} failed to remove:\n`, Utils.errToString(err));
    }).finally(() => {
      RegistryUtils.emit('change', npmRegistry);
    });

  };

  // exports
  RegistryUtils.getRegistry = getRegistry;
  RegistryUtils.install = install;
  RegistryUtils.remove = remove;
  module.exports = RegistryUtils;

});
