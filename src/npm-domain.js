(function () {
  'use strict';

  let domainName = 'brackets-npm-registry-domain';
  let domainManager = null;
  let RegistryBuilder = require('./node/registry-builder');

  let getRegistry = function (callback) {
    RegistryBuilder.buildRegistry().nodeify(callback);
  };

  exports.init = function (_domainManager) {
    domainManager = _domainManager;

    if (!domainManager.hasDomain(domainName)) {
      domainManager.registerDomain(domainName, {major: 0, minor: 1});
    }

    domainManager.registerCommand(
      domainName,
      'getRegistry', // command name
      getRegistry, // handler function
      true, // is async
      'get a list of extensions from npm', // description
      [
        {name: 'extensions', type: 'array'}
      ]
    );
  };

}());
