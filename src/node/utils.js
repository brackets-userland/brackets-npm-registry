/* eslint strict:0 */
'use strict';

const _ = require('lodash');
const path = require('path');
const binPath = path.resolve(__dirname, '..', '..', 'node_modules', '.bin');

exports.processEnvWithPath = function(...paths) {
  const processEnvClone = _.cloneDeep(process.env); // eslint-disable-line
  processEnvClone.Path = paths.concat(binPath, processEnvClone.Path.split(path.delimiter)).join(path.delimiter);
  return processEnvClone;
};
