define(function (require, exports) {
  'use strict';

  let Promise = require('bluebird');
  let NpmDomain = require('../npm-domain');
  let Logger = require('../utils/Logger');
  let downloadedData = null;

  let download = function () {
    let url = 'https://brackets-npm-registry.herokuapp.com/registry';
    return Promise.resolve($.get(url))
      .catch(function (err) {
        Logger.error(err);
        // error downloading? we try to build our own
        return Promise.resolve(NpmDomain.exec('buildRegistry'));
      })
      .then(function (response) {
        downloadedData = response;
        return response;
      });
  };

  let install = function (extensionName) {
    let targetFolder = brackets.app.getApplicationSupportDirectory() + '/extensions/user';
    Logger.log(`installing ${extensionName} into ${targetFolder}`);
    Promise.resolve(
      NpmDomain.exec('installExtension', targetFolder, extensionName)
        .progress(msg => {
          Logger.log(`progress => ${msg}`);
        })
    )
      .then(result => {
        Logger.log(`${extensionName} successfully installed`);
      })
      .catch(err => {
        Logger.log(`${extensionName} failed to install`);
      });
  };

  let getRegistry = function () {
    return downloadedData;
  };

  exports.download = download;
  exports.getRegistry = getRegistry;
  exports.install = install;

});
