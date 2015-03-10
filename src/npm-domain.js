define(function (require, exports, module) {
  'use strict';

  let ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
  let NodeDomain = brackets.getModule('utils/NodeDomain');
  let _domainPath = ExtensionUtils.getModulePath(module, 'node/brackets-node-domain');
  let _nodeDomain = new NodeDomain('brackets-npm-registry-domain', _domainPath);
  module.exports = _nodeDomain;

});
