define(function (require) {
  'use strict';

  let AppInit = brackets.getModule('utils/AppInit');
  let co = require('bluebird').coroutine;
  let toolbarIcon = require('./ui/toolbar-icon');
  let Logger = require('./utils/Logger');
  let registryUtils = require('./ui/registry-utils');

  let init = co(function* () {
    toolbarIcon.init();
    let result = yield registryUtils.download();
    console.log(result);
  });

  AppInit.appReady(function () {
    init().catch(e => Logger.error(e));
  });

});
