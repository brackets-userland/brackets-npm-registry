var expect = require("chai").expect;
var RegistryBuilder = require('../dist/node/registry-builder');
var MINUTE = 60000;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;

describe('npm-domain', function () {

  describe('getExtensions()', function () {

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

});
