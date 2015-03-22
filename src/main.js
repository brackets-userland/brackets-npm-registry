define(function (require) {
  'use strict';

  const _ = brackets.getModule('thirdparty/lodash');
  const AppInit = brackets.getModule('utils/AppInit');
  const ExtensionManager = brackets.getModule('extensibility/ExtensionManager');
  const semver = require('semver');
  const co = require('bluebird').coroutine;
  const toolbarIcon = require('./ui/toolbar-icon');
  const Logger = require('./utils/Logger');
  const registryUtils = require('./ui/registry-utils');

  const init = co(function* () {
    toolbarIcon.init();

    // download the npm registry
    let npmExtensions = yield registryUtils.download();

    // get installed extenions
    let installedExtensions = _.filter(ExtensionManager.extensions,
      ext => ext && ext.installInfo && ext.installInfo.locationType === 'user')
      .map(obj => obj.installInfo.metadata);

    // check for updates
    let availableUpdates = 0;

    installedExtensions.forEach(insExt => {
      let npmInfo = _.find(npmExtensions, npmExt => npmExt.name === insExt.name);
      if (!npmInfo) { return; }
      if (semver.gt(npmInfo.version, insExt.version)) {
        availableUpdates++;
      }
    });

    if (availableUpdates > 0) {
      toolbarIcon.toggle(true);
    }

    Logger.log(npmExtensions);
  });

  AppInit.appReady(function () {
    init().catch(e => Logger.error(e));
  });

});
