/* eslint strict:0 */
'use strict';

const _ = require('lodash');
const path = require('path');
const binPath = path.resolve(__dirname, '..', '..', 'node_modules', '.bin');

exports.processEnvWithPath = function(...paths) {
  const processEnvClone = _.cloneDeep(process.env); // eslint-disable-line
  ['Path', 'PATH'].forEach(pathName => {
    if (processEnvClone[pathName]) {
      processEnvClone[pathName] = paths.concat(
        binPath, processEnvClone[pathName].split(path.delimiter)
      ).join(path.delimiter);
    }
  });
  return processEnvClone;
};
