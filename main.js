/*eslint no-var:0*/

define(function (require, exports, module) {
  'use strict';

  // styling
  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
  ExtensionUtils.loadStyleSheet(module, 'styles/main.less');

  // launch compiled js code
  require(window._babelPolyfill ? [] : ['babel-polyfill'], function () {
    require(['dist/main']);
  });

});
