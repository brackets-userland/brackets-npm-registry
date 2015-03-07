var expect = require("chai").expect;
var npmDomain = require('../dist/npm-domain');

describe('npm-domain', function () {

  describe('getExtensions()', function () {

    it('should return a list of extensions', function (done) {

      this.timeout(100000);

      npmDomain.getExtensions(function (err, response) {
        // console.log(JSON.stringify(response, null, 4));
        done(err);
      });

    });

  });

});
