let registryBuilder = require('../node/registry-builder');
let fs = require('bluebird').promisifyAll(require('fs'));
let path = require('path');
let filepath = path.resolve(__dirname, '../../tmp/registry.json');

console.log('Going to build a registry.json file to', filepath);

registryBuilder.buildRegistry()
  .then(function (registry) {
    return fs.writeFileAsync(filepath, JSON.stringify(registry, null, 2));
  })
  .then(function () {
    console.log('Registry file built at', filepath);
  })
  .catch(function (err) {
    console.error('Failed to build a registry at', filepath);
    console.error(err.name, ':', err.message, '\n', err.stack);
  });
