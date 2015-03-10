define(function (require, exports) {
  'use strict';

  let Promise = require('bluebird');
  let downloadedData = null;

  let download = function () {
    let url = 'https://brackets-npm-registry.herokuapp.com/registry';
    return Promise.resolve($.get(url))
      .then(function (response) {
        downloadedData = response;
        return response;
      });
  };

  exports.download = download;

});
