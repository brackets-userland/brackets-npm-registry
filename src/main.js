define(function (require) {
  'use strict';

  let AppInit = brackets.getModule('utils/AppInit');
  let co = require('bluebird').coroutine;
  let Logger = require('./utils/Logger');
  let SUCCESS = Symbol();

  function promiseResponse() {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(SUCCESS);
      }, 1);
    });
  }

  let tryGenerators = co(function* () {
    let response = yield promiseResponse();
    if (response === SUCCESS) {
      Logger.log('Hello world!');
    } else {
      throw new Error('Response has unexpected value: ' + response);
    }
  });

  AppInit.appReady(function () {
    // co functions return promises
    tryGenerators()
      .catch(e => Logger.error(e));
  });

});
