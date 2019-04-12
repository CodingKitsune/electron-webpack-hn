"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAppConfiguration = getAppConfiguration;
exports.getMainConfiguration = getMainConfiguration;
exports.getRendererConfiguration = getRendererConfiguration;
exports.getDllConfiguration = getDllConfiguration;
exports.configure = exports.createConfigurator = exports.WebpackConfigurator = exports.getTestConfiguration = void 0;

function _bluebirdLst() {
  const data = _interopRequireWildcard(require("bluebird-lst"));

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

function _dotenv() {
  const data = require("dotenv");

  _dotenv = function () {
    return data;
  };

  return data;
}

function _dotenvExpand() {
  const data = _interopRequireDefault(require("dotenv-expand"));

  _dotenvExpand = function () {
    return data;
  };

  return data;
}

function _fsExtraP() {
  const data = require("fs-extra-p");

  _fsExtraP = function () {
    return data;
  };

  return data;
}

function _lazyVal() {
  const data = require("lazy-val");

  _lazyVal = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function _readConfigFile() {
  const data = require("read-config-file");

  _readConfigFile = function () {
    return data;
  };

  return data;
}

function _deepAssign() {
  const data = require("read-config-file/out/deepAssign");

  _deepAssign = function () {
    return data;
  };

  return data;
}

require("source-map-support/register");

function _webpackMerge() {
  const data = _interopRequireDefault(require("webpack-merge"));

  _webpackMerge = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

function _ts() {
  const data = require("./configurators/ts");

  _ts = function () {
    return data;
  };

  return data;
}

function _vue() {
  const data = require("./configurators/vue/vue");

  _vue = function () {
    return data;
  };

  return data;
}

function _BaseTarget() {
  const data = require("./targets/BaseTarget");

  _BaseTarget = function () {
    return data;
  };

  return data;
}

function _MainTarget() {
  const data = require("./targets/MainTarget");

  _MainTarget = function () {
    return data;
  };

  return data;
}

function _RendererTarget() {
  const data = require("./targets/RendererTarget");

  _RendererTarget = function () {
    return data;
  };

  return data;
}

function _util() {
  const data = require("./util");

  _util = function () {
    return data;
  };

  return data;
}

let computeEntryFile = (() => {
  var _ref4 = (0, _bluebirdLst().coroutine)(function* (srcDir, projectDir) {
    const candidates = [];

    for (const ext of ["ts", "js", "tsx", "jsx"]) {
      for (const name of ["index", "main", "app"]) {
        candidates.push(`${name}.${ext}`);
      }
    }

    const file = yield (0, _util().getFirstExistingFile)(candidates, srcDir);

    if (file == null) {
      throw new Error(`Cannot find entry file ${path.relative(projectDir, path.join(srcDir, "index.ts"))} (or main.ts, or app.ts, or index.js, or main.js, or app.js)`);
    }

    return file;
  });

  return function computeEntryFile(_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
})();

let getInstalledElectronVersion = (() => {
  var _ref5 = (0, _bluebirdLst().coroutine)(function* (projectDir) {
    for (const name of ["electron", "electron-prebuilt", "electron-prebuilt-compile"]) {
      try {
        return (yield (0, _fsExtraP().readJson)(path.join(projectDir, "node_modules", name, "package.json"))).version;
      } catch (e) {
        if (e.code !== "ENOENT") {
          throw e;
        }
      }
    }
  });

  return function getInstalledElectronVersion(_x8) {
    return _ref5.apply(this, arguments);
  };
})(); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const _debug = require("debug"); // noinspection JSUnusedGlobalSymbols


function getAppConfiguration(env) {
  return _bluebirdLst().default.filter([configure("main", env), configure("renderer", env)], it => it != null);
} // noinspection JSUnusedGlobalSymbols


function getMainConfiguration(env) {
  return configure("main", env);
} // noinspection JSUnusedGlobalSymbols


function getRendererConfiguration(env) {
  return configure("renderer", env);
} // in the future, if need, isRenderer = true arg can be added
// noinspection JSUnusedGlobalSymbols


function getDllConfiguration(env) {
  return configure("renderer-dll", env);
} // noinspection JSUnusedGlobalSymbols


let getTestConfiguration = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (env) {
    const configurator = yield createConfigurator("test", env);
    return yield configurator.configure({
      testComponents: path.join(process.cwd(), "src/renderer/components/testComponents.ts")
    });
  });

  return function getTestConfiguration(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.getTestConfiguration = getTestConfiguration;

class WebpackConfigurator {
  // electronWebpackConfiguration expected to be resolved (use getElectronWebpackConfiguration())
  constructor(type, env, electronWebpackConfiguration, metadata) {
    this.type = type;
    this.env = env;
    this.electronWebpackConfiguration = electronWebpackConfiguration;
    this.metadata = metadata;
    this.electronVersionPromise = new (_lazyVal().Lazy)(() => getInstalledElectronVersion(this.projectDir));
    this.isTest = this.type === "test";
    this.debug = _debug(`electron-webpack:${this.type}`);
    this._configuration = null;
    this.rules = [];
    this.plugins = []; // js must be first - e.g. iView has two files loading-bar.js and loading-bar.vue - when we require "loading-bar", js file must be resolved and not vue

    this.extensions = [".js", ".json", ".node"];
    this._electronVersion = null;
    this.entryFiles = [];

    if (metadata.dependencies == null) {
      metadata.dependencies = {};
    }

    if (metadata.devDependencies == null) {
      metadata.devDependencies = {};
    }

    this.projectDir = electronWebpackConfiguration.projectDir;
    this.isRenderer = type.startsWith("renderer");
    process.env.BABEL_ENV = type;
    this.isProduction = this.env.production == null ? process.env.NODE_ENV === "production" : this.env.production;
    this.debug(`isProduction: ${this.isProduction}`);
    this.sourceDir = this.getSourceDirectory(this.type);
    this.commonSourceDirectory = this.electronWebpackConfiguration.commonSourceDirectory;
    this.commonDistDirectory = this.electronWebpackConfiguration.commonDistDirectory;
  }

  get config() {
    return this._configuration;
  }

  get electronVersion() {
    return this._electronVersion;
  }
  /**
   * Returns null if code processing for type is disabled.
   */


  getSourceDirectory(type) {
    const part = this.getPartConfiguration(type);

    if (part === null || part != null && part.sourceDirectory === null) {
      // part or sourceDirectory is explicitly set to null
      return null;
    }

    const result = part == null ? null : part.sourceDirectory;

    if (result == null) {
      return path.join(this.projectDir, "src", type.startsWith("renderer") || type === "test" ? "renderer" : type);
    } else {
      return path.resolve(this.projectDir, result);
    }
  }

  getPartConfiguration(type) {
    if (type === "main") {
      return this.electronWebpackConfiguration.main;
    } else {
      return this.electronWebpackConfiguration.renderer;
    }
  }

  hasDependency(name) {
    return name in this.metadata.dependencies || this.hasDevDependency(name);
  }

  hasDevDependency(name) {
    return name in this.metadata.devDependencies;
  }
  /**
   * Returns the names of devDependencies that match a given string or regex.
   * If no matching dependencies are found, an empty array is returned.
   *
   * @return list of matching dependency names, e.g. `["@babel/preset-react", "@babel/preset-stage-0"]`
   */


  getMatchingDevDependencies(options = {}) {
    const includes = options.includes || [];
    const excludes = new Set(options.excludes || []);
    return Object.keys(this.metadata.devDependencies).filter(name => !excludes.has(name) && includes.some(prefix => name.startsWith(prefix)));
  }

  configure(entry) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      // noinspection SpellCheckingInspection
      _this._configuration = {
        context: _this.projectDir,
        devtool: _this.isProduction || _this.isTest ? "nosources-source-map" : "eval-source-map",
        externals: _this.computeExternals(),
        node: {
          __dirname: !_this.isProduction,
          __filename: !_this.isProduction
        },
        output: {
          filename: "[name].js",
          chunkFilename: "[name].bundle.js",
          libraryTarget: "commonjs2",
          path: path.join(_this.commonDistDirectory, _this.type)
        },
        target: _this.isTest ? "node" : `electron-${_this.type === "renderer-dll" ? "renderer" : _this.type}`,
        resolve: {
          alias: {
            "@": _this.sourceDir,
            common: _this.commonSourceDirectory
          },
          extensions: _this.extensions
        },
        module: {
          rules: _this.rules
        },
        plugins: _this.plugins
      };

      if (entry != null) {
        _this._configuration.entry = entry;
      } // if electronVersion not specified, use latest


      _this._electronVersion = _this.electronWebpackConfiguration.electronVersion || (yield _this.electronVersionPromise.value) || "3.0.7";

      const target = (() => {
        switch (_this.type) {
          case "renderer":
            return new (_RendererTarget().RendererTarget)();

          case "renderer-dll":
            return new (_RendererTarget().BaseRendererTarget)();

          case "test":
            return new (_RendererTarget().BaseRendererTarget)();

          case "main":
            return new (_MainTarget().MainTarget)();

          default:
            return new (_BaseTarget().BaseTarget)();
        }
      })();

      _this.debug(`Target class: ${target.constructor.name}`);

      target.configureRules(_this);
      yield Promise.all([target.configurePlugins(_this), (0, _ts().configureTypescript)(_this)]);
      (0, _vue().configureVue)(_this);

      if (_this.debug.enabled) {
        _this.debug(`\n\n${_this.type} config:` + JSON.stringify(_this._configuration, null, 2) + "\n\n");
      }

      if (_this.config.entry == null) {
        _this.entryFiles.push((yield computeEntryFile(_this.sourceDir, _this.projectDir)));

        _this.config.entry = {
          [_this.type]: _this.entryFiles
        };
        const mainConfiguration = _this.electronWebpackConfiguration.main || {};
        let extraEntries = mainConfiguration.extraEntries;

        if (_this.type === "main" && extraEntries != null) {
          if (typeof extraEntries === "string") {
            extraEntries = [extraEntries];
          }

          if (Array.isArray(extraEntries)) {
            for (const p of extraEntries) {
              _this.config.entry[path.basename(p, path.extname(p))] = p;
            }
          } else {
            Object.assign(_this.config.entry, extraEntries);
          }
        }
      }

      _this._configuration = yield _this.applyCustomModifications(_this.config);
      return _this.config;
    })();
  }

  applyCustomModifications(config) {
    const {
      renderer,
      main
    } = this.electronWebpackConfiguration;

    const applyCustom = configPath => {
      const customModule = require(path.join(this.projectDir, configPath));

      if (typeof customModule === "function") {
        return customModule(config);
      } else {
        return _webpackMerge().default.smart(config, customModule);
      }
    };

    if (this.type === "renderer" && renderer && renderer.webpackConfig) {
      return applyCustom(renderer.webpackConfig);
    }

    if (this.type === "renderer-dll" && renderer && renderer.webpackDllConfig) {
      return applyCustom(renderer.webpackDllConfig);
    }

    if (this.type === "main" && main && main.webpackConfig) {
      return applyCustom(main.webpackConfig);
    }

    return config;
  }

  computeExternals() {
    const whiteListedModules = new Set(this.electronWebpackConfiguration.whiteListedModules || []);

    if (this.isRenderer) {
      whiteListedModules.add("react");
      whiteListedModules.add("react-dom");
      whiteListedModules.add("vue");
    }

    const filter = name => !name.startsWith("@types/") && (whiteListedModules == null || !whiteListedModules.has(name));

    const externals = Object.keys(this.metadata.dependencies).filter(filter);
    externals.push("electron");
    externals.push("webpack"); // because electron-devtools-installer specified in the devDependencies, but required in the index.dev

    externals.push("electron-devtools-installer");

    if (this.type === "main") {
      externals.push("webpack/hot/log-apply-result");
      externals.push("electron-webpack/out/electron-main-hmr/HmrClient");
      externals.push("source-map-support/source-map-support.js");
    }

    if (this.electronWebpackConfiguration.externals != null) {
      return externals.concat(this.electronWebpackConfiguration.externals);
    }

    return externals;
  }

}

exports.WebpackConfigurator = WebpackConfigurator;
const schemeDataPromise = new (_lazyVal().Lazy)(() => (0, _fsExtraP().readJson)(path.join(__dirname, "..", "scheme.json")));

let createConfigurator = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (type, env) {
    if (env != null) {
      // allow to pass as `--env.autoClean=false` webpack arg
      const _env = env;

      for (const name of ["minify", "autoClean", "production"]) {
        if (_env[name] === "true") {
          _env[name] = true;
        } else if (_env[name] === "false") {
          _env[name] = false;
        }
      }
    }

    if (env == null) {
      env = {};
    }

    const projectDir = (env.configuration || {}).projectDir || process.cwd();
    const packageMetadata = (0, _config().getPackageMetadata)(projectDir);
    const electronWebpackConfig = yield (0, _config().getElectronWebpackConfiguration)({
      packageMetadata,
      projectDir
    });

    if (env.configuration != null) {
      (0, _deepAssign().deepAssign)(electronWebpackConfig, env.configuration);
    }

    yield (0, _readConfigFile().validateConfig)(electronWebpackConfig, schemeDataPromise, message => {
      return `${message}

How to fix:
1. Open https://webpack.electron.build/configuration
2. Search the option name on the page.
  * Not found? The option was deprecated or not exists (check spelling).
  * Found? Check that the option in the appropriate place. e.g. "sourceDirectory" only in the "main" or "renderer", not in the root.
`;
    });
    return new WebpackConfigurator(type, env, electronWebpackConfig, (yield packageMetadata.value));
  });

  return function createConfigurator(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

exports.createConfigurator = createConfigurator;

let configure = (() => {
  var _ref3 = (0, _bluebirdLst().coroutine)(function* (type, env) {
    const configurator = yield createConfigurator(type, env);
    const sourceDir = configurator.sourceDir; // explicitly set to null - do not handle at all and do not show info message

    if (sourceDir === null) {
      return null;
    }

    const processEnv = configurator.isProduction ? "production" : "development";
    const dotEnvPath = path.resolve(configurator.projectDir, ".env");
    const dotenvFiles = [`${dotEnvPath}.${processEnv}.local`, `${dotEnvPath}.${processEnv}`, `${dotEnvPath}.local`, dotEnvPath];

    for (const file of dotenvFiles) {
      const exists = yield (0, _fsExtraP().pathExists)(file);

      if (exists) {
        (0, _dotenvExpand().default)((0, _dotenv().config)({
          path: file
        }));
      }
    }

    return yield configurator.configure();
  });

  return function configure(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
})();

exports.configure = configure;
// __ts-babel@6.0.4
//# sourceMappingURL=main.js.map