define(function (require) {
  'use strict';

  const AppInit = brackets.getModule('utils/AppInit');
  const { coroutine: co } = require('bluebird');
  const toolbarIcon = require('./ui/toolbar-icon');
  const Logger = require('./utils/logger');
  const registryUtils = require('./ui/registry-utils');
  const Preferences = require('./utils/preferences');

  const init = co(function* () {
    toolbarIcon.init();

    const CHECK_PERIOD = 12 * 60 * 60 * 1000; // 12 hours * 60 minutes * 60 seconds * 1000 millis
    let lastUpdateCheck = Preferences.get('lastUpdateCheck') || 0;
    let currentTime = new Date().valueOf();
    if (currentTime - CHECK_PERIOD > lastUpdateCheck) {
      registryUtils.getRegistry()
        .then(function () {
          Preferences.set('lastUpdateCheck', currentTime);
        });
    }
  });

  AppInit.appReady(() => init().catch(e => Logger.error(e)));

});
