var npmDomain = require('./dist/npm-domain');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/registry', function (request, response, next) {

  npmDomain.getExtensions()
    .then(function (result) {
      response.send(result);
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
