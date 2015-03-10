define(function (require, exports) {
  'use strict';

  let Logger = require('../utils/Logger');
  let $icon = $('<a id="brackets-npm-registry-icon" href="#"></a>');

  exports.init = function () {

    $icon
      .appendTo('#main-toolbar .buttons')
      .on('click', function () {
        Logger.log('click on icon');
      });

  };

});
