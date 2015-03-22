/*eslint no-var:0*/

define(function (require, exports, module) {
  'use strict';

  // styling
  var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
  ExtensionUtils.loadStyleSheet(module, 'styles/main.less');

  // launch compiled js code
  if (!window.regeneratorRuntime) { require('babel-polyfill'); }
  require('dist/main');

  /*
  // TODO: provide base for writing unit tests
  if (window.isBracketsTestWindow) { }
  */

});
