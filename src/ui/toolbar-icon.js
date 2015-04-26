define(function (require, exports) {
  'use strict';

  const RegistryDialog = require('./react-components/registry-dialog');
  const Preferences = require('../utils/preferences');
  const $icon = $('<a id="brackets-npm-registry-icon" href="#"></a>');

  exports.init = function () {
    $icon
      .appendTo('#main-toolbar .buttons')
      .toggleClass('active', Preferences.get('lastToolbarIconState'))
      .on('click', () => RegistryDialog.show());
  };

  exports.toggle = function (bool) {
    $icon.toggleClass('active', bool);
    Preferences.set('lastToolbarIconState', bool);
  };

});
