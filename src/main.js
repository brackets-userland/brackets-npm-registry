'use strict';

let co = require('bluebird').coroutine;
let SUCCESS = Symbol();

function promiseResponse() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(SUCCESS);
    }, 1);
  });
}

let tryGenerators = co(function* () {
  var response = yield promiseResponse();
  if (response === SUCCESS) {
    console.log('ES6 generators work!');
  } else {
    console.error('ES6 generators failed...');
  }
});

module.exports = function () {
  console.log('brackets-npm-registry is starting...');
  tryGenerators();
};
