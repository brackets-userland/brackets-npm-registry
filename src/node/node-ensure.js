/*eslint strict:0,no-process-env:0*/
'use strict';

/*
  adds the current node process to the system path
*/

const Promise = require('bluebird');
const { promisify, promisifyAll } = require('bluebird');
const fs = promisifyAll(require('fs-extra'));
const path = require('path');
const which = promisify(require('which'));

const splitChar = process.platform === 'win32' ? `;` : `:`;

let pushedPath;

function revertPathChanges() {
  let paths = process.env.PATH.split(splitChar);
  if (paths[0] === pushedPath) {
    paths.shift();
  }
  process.env.PATH = paths.join(splitChar);
}

let createSymlinkPromise;
function createSymlink(desiredName) {
  if (createSymlinkPromise) { return createSymlinkPromise; }

  let nodeSymlinkDir = path.resolve(__dirname, 'nodeSymlinkDir');
  let nodeLinkPath = path.resolve(nodeSymlinkDir, desiredName);
  createSymlinkPromise = fs.ensureDirAsync(nodeSymlinkDir)
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
  return createSymlinkPromise;
}

function nodeEnsure(contextFunction) {

  return which(`node`)
    .catch(() => null) // ignore the errors
    .then(whichNode => {
      // use the node from process.execPath so any compiled dependencies use same version of node as brackets
      // we need a symlink if process.execPath is different from node/node.exe
      let currentName = path.basename(process.execPath);
      let desiredName = process.platform === `win32` ? `node.exe` : `node`;

      if (currentName === desiredName) {
        return process.execPath;
      }

      return createSymlink(desiredName)
        .catch(err => {
          if (whichNode) { return whichNode; }
          throw err;
        });
    })
    .then(nodePath => {
      // ensure that nodePath is in the system path
      let paths = process.env.PATH.split(splitChar);
      pushedPath = path.dirname(nodePath);
      paths.unshift(pushedPath);
      process.env.PATH = paths.join(splitChar);
      return nodePath;
    })
    .then(nodePath => {
      if (contextFunction) {
        return Promise.resolve(contextFunction(nodePath));
      }
      return nodePath;
    })
    .finally(() => {
      if (contextFunction) {
        revertPathChanges();
      }
    });
}

module.exports = {
  revertPathChanges,
  nodeEnsure
};
