var express = require('express');
var app = express();
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var filepath = path.resolve(__dirname, '../../tmp/registry.json');

app.set('port', (process.env.PORT || 5000));

app.get('/registry', function (request, response, next) {

  fs.readFile(filepath, { encoding: 'utf8' }, function (err, str) {

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

function callBuildScript() {

  let args = ['build-script.js'];

  console.log('calling: node', args.join(' '));

  let buildScript = spawn('node', args, {
    cwd: __dirname
  });

  buildScript.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  buildScript.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  buildScript.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });

}

// call on startup
setTimeout(callBuildScript, 1);
// and then every 15 minutes
setInterval(callBuildScript, 15 * 60000);
