const path = require("path");
const fs = require("fs");
const _ = require('lodash')

const DEFAULT_ALIAS = {'@': path.resolve(process.cwd(), 'src')};
let ALIAS_CACHE = DEFAULT_ALIAS;

function transformer(file, api) {
  const j = api.jscodeshift;
  getAlias();
  const source = j(file.source)
    .find(j.ImportDeclaration)
    .forEach((path) => {
      path.node.source.value = combineAbsPath(path.node.source.value);
    })
    .toSource();
  return source;
}

function getAlias() {
  if (!ALIAS_CACHE) {
    const configPath = path.join(process.cwd(), "vue.config.js");
    const hasConfig = fs.existsSync(configPath);
    if (hasConfig) {
      const config = require(path.join(process.cwd(), "vue.config.js"));
      try {
        ALIAS_CACHE = {ALIAS_CACHE, ...config.configureWebpack.resolve.alias};  
      } catch (error) {
        ALIAS_CACHE = DEFAULT_ALIAS;
      }
      
    } else {
      ALIAS_CACHE = DEFAULT_ALIAS;
    }
  }
}

function combineAbsPath(path) {
  let absPath = String(path || '');
  const alias = Object.keys(ALIAS_CACHE);
  if (alias.length > 0) {
    alias.map((key) => {
      const dir = path.replace(new RegExp(`${key}`), ALIAS_CACHE[key])
      const exist = fs.existsSync(`${dir}.vue`)
      if (exist) {
        absPath = `${path}.vue`;
      }
    });
  }
  return absPath;
}

exports.default = transformer;