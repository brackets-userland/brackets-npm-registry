/* eslint strict:0 */
'use strict';

/*
  returns current node process path
*/

const { promisify, promisifyAll } = require('bluebird');
const fs = promisifyAll(require('fs-extra'));
const path = require('path');
const which = promisify(require('which'));
let result;

module.exports = function () {
  if (result) { return result; }

  result = which(`node`)
    .catch(() => null) // ignore the errors
    .then(whichNode => {
      // use the node from process.execPath so any compiled dependencies use same version of node as brackets
      // we need a symlink if process.execPath is different from node/node.exe
      let currentName = path.basename(process.execPath);
      let desiredName = process.platform === `win32` ? `node.exe` : `node`;

      if (currentName === desiredName) {
        return process.execPath;
      }

      let nodeSymlinkDir = path.resolve(__dirname, 'nodeSymlinkDir');
      let nodeLinkPath = path.resolve(nodeSymlinkDir, desiredName);
      return fs.ensureDirAsync(nodeSymlinkDir)
        .then(() => {
          return fs.lstatAsync(nodeLinkPath);
        })
        .catch(() => null) // ignore the errors
        .then(stat => {
          if (stat && stat.isSymbolicLink()) {
            return fs.unlinkAsync(nodeLinkPath);
          }
        })
        .then(() => {
          return fs.symlinkAsync(process.execPath, nodeLinkPath);
        })
        .then(() => {
          return nodeLinkPath;
        })
        .catch(err => {
          if (whichNode) { return whichNode; }
          throw err;
        });
    });

  return result;
};
