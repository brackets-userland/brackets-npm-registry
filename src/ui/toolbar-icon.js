define(function (require, exports) {
  'use strict';

  let RegistryDialog = require('./registry-dialog');
  let $icon = $('<a id="brackets-npm-registry-icon" href="#"></a>');

  exports.init = function () {
    $icon
      .appendTo('#main-toolbar .buttons')
      .on('click', () => RegistryDialog.show());
  };

  exports.toggle = function (bool) {
    $icon
      .toggleClass('active', bool);
  };

});
