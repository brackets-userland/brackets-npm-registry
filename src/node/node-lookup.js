/*eslint strict:0,no-process-env:0*/
'use strict';

/*
  checks if node is in the system path, and if not add its path to process.env.PATH
*/

const _ = require('lodash');
const Promise = require('bluebird');
const { any, promisify } = require('bluebird');
const path = require('path');
const which = promisify(require('which'));
const buffspawn = require('buffered-spawn');
let log = () => {};
let result;

let commonNodeLocations = process.platform === 'win32' ? [
  'C:\Program Files\nodejs\node.exe',
  'C:\Program Files (x86)\nodejs\node.exe'
] : [
  '/usr/bin/node',
  '/usr/local/bin/node'
];

const lookForNodeElsewhere = function (resolve, reject) {
  log(`looking for node in common locations:\n`, commonNodeLocations.join(`, `));
  // FUTURE: maybe check if stdout is a valid node version?
  // FUTURE: maybe if multiple version are found, return the latest one?
  any(commonNodeLocations.map(
    path => which(path).then(
    path => buffspawn(path, ['--version']).spread(
    (/*stdout, stderr*/) => path))
  )).then(path => {
    log(`found node at:\n`, path);
    resolve(path);
  }).catch(errs => {
    // .any returns errs array
    if (errs.forEach) {
      errs.forEach(err => {
        log('failed to find node in common locations:\n', err.name, ':', err.message);
      });
    }
    let err = new Error();
    err.name = 'Error';
    err.message = 'failed to find node executable';
    err.details = errs;
    reject(err);
  });
};

const lookForNodeInPath = function (resolve, reject) {
  which(`node`)
    .then(cmd => {
      if (!cmd) {
        log(`couldn't find node in system path`);
        return lookForNodeElsewhere(resolve, reject);
      }
      return resolve(cmd);
    })
    .catch(err => {
      log(`error looking for node in system path:\n`, err.name, `:`, err.message);
      return lookForNodeElsewhere(resolve, reject);
    });
};

module.exports = function (customNodePath, logger) {
  if (result) { return result; }

  if (logger) { log = logger; }

  if (customNodePath) {
    commonNodeLocations.unshift(customNodePath);
  }

  commonNodeLocations = _.uniq(_.compact(commonNodeLocations));

  result = new Promise(function (resolve, reject) {
    lookForNodeInPath(resolve, reject);
  }).then(nodePath => {
    let splitChar = process.platform === 'win32' ? `;` : `:`;
    let paths = process.env.PATH.split(splitChar);
    paths.unshift(path.dirname(nodePath));
    process.env.PATH = _.uniq(paths).join(splitChar);
    return nodePath;
  });

  return result;
};
