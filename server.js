var registryBuilder = require('./dist/node/registry-builder');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/registry', function (request, response, next) {

  registryBuilder.buildRegistry()
    .then(function (registry) {
      response.send(registry);
    })
    .catch(function (err) {
      next(err);
    });

});

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

setTimeout(function () {
  registryBuilder.buildRegistry();
}, 1000);
