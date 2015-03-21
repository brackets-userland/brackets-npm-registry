/*eslint strict:0, no-console:0*/
'use strict';

const npm = require('npm');
const { all, fromNode } = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const logOutput = function (...args) { console.log(...args); };
const logProgress = function (...args) { console.error(...args); };

function install(targetPath, npmPackageName) {

  const npmInstallFolder = path.resolve(targetPath, 'node_modules', npmPackageName);
  const finalInstallFolder = path.resolve(targetPath, npmPackageName);

  logProgress('loading npm');
  return fromNode(npm.load.bind(npm))
    .then(() => {
      // npm is loaded, we can start the installation
      logProgress(`executing npm install ${targetPath} ${npmPackageName}`);
      return fromNode(npm.commands.install.bind(npm.commands, targetPath, npmPackageName));
    })
    .then(() => {
      logProgress('installation successful into directory:\n', npmInstallFolder);
      logProgress('ensuring the target directory exists:\n', finalInstallFolder);
      return fromNode(fs.ensureDir.bind(fs, finalInstallFolder));
    })
    .then(() => {
      // final directory is there, read its contents
      return fromNode(fs.readdir.bind(fs, finalInstallFolder));
    })
    .then(dirContents => {
      logProgress('clearing the directory:\n', finalInstallFolder);
      return all(dirContents.map(entry => {
        if (entry === '.git') { return null; }
        return fromNode(fs.remove.bind(fs, path.resolve(finalInstallFolder, entry)));
      }).filter(x => !!x));
    })
    .then(() => {
      // read contents of installed directory
      return fromNode(fs.readdir.bind(fs, npmInstallFolder));
    })
    .then(dirContents => {
      logProgress('moving files from:\n', npmInstallFolder, '\ninto:\n', finalInstallFolder);
      return all(dirContents.map(entry => {
        return fromNode(fs.move.bind(fs,
                                     path.resolve(npmInstallFolder, entry),
                                     path.resolve(finalInstallFolder, entry)));
      }));
    })
    .then(() => {
      logOutput(`successfully installed ${npmPackageName}`);
    })
    .catch(err => {
      logProgress(err);
      throw err;
    })
    .finally(() => {
      // all done, now just remove the node_modules temp directory
      return fromNode(fs.remove.bind(fs, path.resolve(targetPath, 'node_modules')));
    });

}

if (process.argv[1] === __filename) {
  install(...process.argv.slice(2));
} else {
  module.exports = install;
}
