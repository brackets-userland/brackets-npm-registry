var fs = require('fs');
var path = require('path');
var registryBuilder = require('./dist/node/registry-builder');
var express = require('express');
var app = express();
var filename = path.resolve(__dirname, 'registry.json');

app.set('port', (process.env.PORT || 5000));

app.get('/registry', function (request, response, next) {

  fs.readFile(filename, { encoding: 'utf8' }, function (err, str) {

    if (err) {
      return next(err);
    }

    try {
      response.send(JSON.parse(str));
    } catch (err) {
      next(err);
    }

  });

});

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

function rebuildRegistry () {
  registryBuilder.buildRegistry()
    .then(function (registry) {
      fs.writeFileSync(filename, JSON.stringify(registry));
      console.log('registry file refreshed');
    })
    .catch(function (err) {
      console.error(err);
    });
}

setTimeout(function () {
  rebuildRegistry();
}, 1);

setInterval(function () {
  rebuildRegistry();
}, 15 * 60000);
