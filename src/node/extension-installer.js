/*eslint strict:0*/
'use strict';

const npm = require('npm');
const { all, fromNode } = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const { log } = console;

function install(targetPath, npmPackageName) {

  const npmInstallFolder = path.resolve(targetPath, 'node_modules', npmPackageName);
  const finalInstallFolder = path.resolve(targetPath, npmPackageName);

  log('loading npm');
  return fromNode(npm.load.bind(npm))
    .then(() => {
      // npm is loaded, we can start the installation
      log(`executing npm install ${targetPath} ${npmPackageName}`);
      return fromNode(npm.commands.install.bind(npm.commands, targetPath, npmPackageName));
    })
    .then(() => {
      log('installation successful into directory:\n', npmInstallFolder);
      log('ensuring the target directory exists:\n', finalInstallFolder);
      return fromNode(fs.ensureDir.bind(fs, finalInstallFolder));
    })
    .then(() => {
      // final directory is there, read its contents
      return fromNode(fs.readdir.bind(fs, finalInstallFolder));
    })
    .then(dirContents => {
      log('clearing the directory:\n', finalInstallFolder);
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
      log('moving files from:\n', npmInstallFolder, '\ninto:\n', finalInstallFolder);
      return all(dirContents.map(entry => {
        return fromNode(fs.move.bind(fs,
                                     path.resolve(npmInstallFolder, entry),
                                     path.resolve(finalInstallFolder, entry)));
      }));
    })
    .then(() => {
      log(`successfully installed ${npmPackageName}`);
    })
    .catch(err => {
      log(err);
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
