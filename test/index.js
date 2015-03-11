/*eslint no-var: 0*/

var expect = require('chai').expect;
var RegistryBuilder = require('../dist/node/registry-builder');
var ExtensionInstaller = require('../dist/node/extension-installer');
var MINUTE = 60000;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;

describe('npm-domain', function () {

  describe.skip('getExtensions', function () {

    it('should return a list of extensions', function (done) {

      if (process.env.TRAVIS) {
        return done();
      }

      this.timeout(DAY);

      RegistryBuilder.buildRegistry()
        .then(function (ok) { done(); })
        .catch(function (err) { done(err); });

    });

  });

  describe('installExtensions', function () {

    it('should install an extension', function (done) {

      this.timeout(DAY);

      var path = '/Users/zaggino/Library/Application Support/Brackets/extensions/user';
      var name = 'brackets-es6-hello-world';

      ExtensionInstaller.install(path, name)
        .then(function (ok) { done(); })
        .catch(function (err) { done(err); });

    });

  });

});
