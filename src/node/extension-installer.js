/*eslint strict:0, no-console:0*/
'use strict';

// https://nodejs.org/api/modules.html#modules_accessing_the_main_module
const runDirectly = require.main === module;
const npm = require('npm');
const { all, fromNode, promisify } = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const rimraf = promisify(require('rimraf'));
const defaultLogger = {
  output: (...args) => console.log(...args),
  progress: (...args) => console.error(...args)
};

function install(targetPath, npmPackageName, loggers) {

  if (runDirectly) {
    loggers = null;
  }

  const npmInstallFolder = path.resolve(targetPath, 'node_modules', npmPackageName);
  const finalInstallFolder = path.resolve(targetPath, npmPackageName);

  const logOutput = loggers ? loggers.output : defaultLogger.output;
  const logProgress = loggers ? loggers.progress : defaultLogger.progress;

  logProgress(`using node ${process.version}`);
  logProgress(`loading npm`);
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
        return rimraf(path.resolve(finalInstallFolder, entry));
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
      let msg = `successfully installed ${npmPackageName}`;
      if (runDirectly) {
        logOutput(msg);
      }
      return msg;
    })
    .catch(err => {
      if (runDirectly) {
        logProgress(err);
      }
      throw err;
    })
    .finally(() => {
      // all done, now just remove the node_modules temp directory
      return rimraf(path.resolve(targetPath, 'node_modules'));
    });

}

if (runDirectly) {
  install(...process.argv.slice(2));
} else {
  exports.install = install;
}
