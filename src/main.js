define(function (require) {
  'use strict';

  const AppInit = brackets.getModule('utils/AppInit');
  const { coroutine: co } = require('bluebird');
  const toolbarIcon = require('./ui/toolbar-icon');
  const Logger = require('./utils/logger');
  const registryUtils = require('./ui/registry-utils');

  const init = co(function* () {
    toolbarIcon.init();
    // TODO: check for updates at most once every 6 hours?
    registryUtils.getRegistry();
  });

  AppInit.appReady(() => init().catch(e => Logger.error(e)));

});
