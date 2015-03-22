# brackets-npm-registry [![Build Status](https://travis-ci.org/zaggino/brackets-npm-registry.svg?branch=master)](https://travis-ci.org/zaggino/brackets-npm-registry)
Extension to install other extensions with npm

## installing brackets-npm-registry

### mac

```
cd ~/Library/Application\ Support/Brackets/extensions/user/
git clone https://github.com/zaggino/brackets-npm-registry.git brackets-npm-registry
cd brackets-npm-registry
npm install
```

### windows - not tested yet

```
cd c:\Users\<user>\AppData\Roaming\Brackets\extensions\user
git clone https://github.com/zaggino/brackets-npm-registry.git brackets-npm-registry
cd brackets-npm-registry
npm install
```

### linux - not tested yet

```
cd ???
git clone https://github.com/zaggino/brackets-npm-registry.git brackets-npm-registry
cd brackets-npm-registry
npm install
```

## uploading an extension to the npm

- package.json needs to have `"brackets-extension"` defined in `"keywords"`
- package.json needs to have `"brackets": "<version>"` defined in `"engines"`
- see sample [package.json](https://github.com/zaggino/brackets-es6-hello-world/blob/master/package.json)
- use `npm publish` to upload the extension to the npm
- installation works in the same way `npm install` does, all dependencies are downloaded and `install` script is executed

## gulp tasks

`gulp test` - lint your sources with ESLint

`gulp build` - build your ES6 files into ES5 so Brackets is able to run them

`gulp watch` - watch files for changes and compile them as you go
