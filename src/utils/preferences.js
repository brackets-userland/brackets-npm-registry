define(function (require, exports, module) {
  'use strict';

  const _ = brackets.getModule('thirdparty/lodash');
  const packageInfo = JSON.parse(require('text!../../package.json'));
  const PreferencesManager = brackets.getModule('preferences/PreferencesManager');
  const StateManager = PreferencesManager.stateManager;
  const prefix = packageInfo.name;

  const defaultPreferences = {
    nodePath: {
      type: 'string',
      value: null
    }
  };

  const prefixed = key => prefix + '.' + key;

  _.each(defaultPreferences, function (definition, key) {
    PreferencesManager.definePreference(prefixed(key), definition.type, definition.value);
  });
  PreferencesManager.save();

  function get(key) {
    let location = defaultPreferences[key] ? PreferencesManager : StateManager;
    arguments[0] = prefixed(key);
    return location.get.apply(location, arguments);
  }

  function set(key) {
    let location = defaultPreferences[key] ? PreferencesManager : StateManager;
    arguments[0] = prefixed(key);
    let retVal = location.set.apply(location, arguments);
    location.save();
    return retVal;
  }

  module.exports = {
    get: get,
    set: set
  };

});
