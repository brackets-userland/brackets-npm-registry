[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]

# brackets-npm-registry

Extension to install other extensions with npm

## How to install brackets-npm-registry

It's recommended to have [node.js](https://nodejs.org/) or [io.js](https://iojs.org/) installed.

### mac

```
sudo npm install --global gulp-cli
cd ~/Library/Application\ Support/Brackets/extensions/user/
git clone https://github.com/zaggino/brackets-npm-registry.git brackets-npm-registry
cd brackets-npm-registry
npm install
```

### windows

```
npm install --global gulp-cli
cd %HOMEPATH%\AppData\Roaming\Brackets\extensions\user
git clone https://github.com/zaggino/brackets-npm-registry.git brackets-npm-registry
cd brackets-npm-registry
npm install
```

### linux

```
sudo npm install --global gulp-cli
cd ~/.config/Brackets/extensions/user
git clone https://github.com/zaggino/brackets-npm-registry.git brackets-npm-registry
cd brackets-npm-registry
npm install
```

## How to upload extensions so the brackets-npm-registry is able to find them

- package.json needs to have `"brackets-extension"` defined in `"keywords"`
- package.json needs to have `"brackets": "<version>"` defined in `"engines"`
- see sample [package.json](https://github.com/zaggino/brackets-es6-hello-world/blob/master/package.json)
- use `npm publish` to upload the extension to the npm
- installation works in the same way `npm install` does, all dependencies are downloaded and `install` script is executed

## How to hack on brackets-npm-registry

This extension is written in ES6, so you'll need a few handy gulp tasks when doing any modifications to it.

### gulp tasks

`gulp build` - build your ES6 files into ES5 so Brackets is able to run them

`gulp watch` - watch files for changes and compile them as you work

`gulp test` - lint your sources with ESLint

[npm-image]: https://img.shields.io/npm/v/brackets-npm-registry.svg?style=flat-square
[npm-url]: https://npmjs.org/package/brackets-npm-registry
[travis-image]: https://img.shields.io/travis/zaggino/brackets-npm-registry/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/zaggino/brackets-npm-registry
[downloads-image]: http://img.shields.io/npm/dm/brackets-npm-registry.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/brackets-npm-registry