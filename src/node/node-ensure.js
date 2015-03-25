/*eslint strict:0,no-process-env:0*/
'use strict';

/*
  adds the current node process to the system path
*/

const _ = require('lodash');
const { promisify, promisifyAll } = require('bluebird');
const fs = promisifyAll(require('fs-extra'));
const path = require('path');
const which = promisify(require('which'));
let result;

module.exports = function () {
  if (result) { return result; }

  result = which(`node`)
    .catch(() => null) // ignore the errors
    .then(nodePath => {
      // if we didn't find node, we create a symlink to the current one
      if (!nodePath) {
        let nodeSymlinkDir = path.resolve(__dirname, 'nodeSymlinkDir');
        let nodeLinkPath = path.resolve(nodeSymlinkDir,
                                        process.platform === 'win32' ? `node.exe` : `node`);
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
          });
      }
      return nodePath;
    })
    .then(nodePath => {
      // ensure that nodePath is in the system path
      let splitChar = process.platform === 'win32' ? `;` : `:`;
      let paths = process.env.PATH.split(splitChar);
      paths.unshift(path.dirname(nodePath));
      process.env.PATH = _.uniq(paths).join(splitChar);
      return nodePath;
    });

  return result;
};
