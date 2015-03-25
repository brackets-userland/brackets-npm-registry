/*eslint strict:0,no-process-env:0*/
'use strict';

/*
  adds the current node process to the system path
*/

const _ = require('lodash');
const { promisifyAll } = require('bluebird');
const fs = promisifyAll(require('fs-extra'));
const path = require('path');

let nodeSymlinkDir = path.resolve(__dirname, 'nodeSymlinkDir');
let result;

module.exports = function () {
  if (result) { return result; }

  let nodeLinkPath = path.resolve(nodeSymlinkDir, 'node');
  result = fs.ensureDirAsync(nodeSymlinkDir)
    .then(() => {
      // create symlink to node
      return fs.symlinkAsync(process.execPath, nodeLinkPath);
    })
    .then(() => {
      // add symlink dir to system path
      let splitChar = process.platform === 'win32' ? `;` : `:`;
      let paths = process.env.PATH.split(splitChar);
      paths.unshift(nodeSymlinkDir);
      process.env.PATH = _.uniq(paths).join(splitChar);
      return nodeLinkPath;
    });

  return result;
};
