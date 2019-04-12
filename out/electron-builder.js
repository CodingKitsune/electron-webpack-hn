"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _bluebirdLst() {
  const data = require("bluebird-lst");

  _bluebirdLst = function () {
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

var _default = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (context) {
    const electronWebpackConfig = yield (0, _config().getElectronWebpackConfiguration)(context);
    const distDir = electronWebpackConfig.commonDistDirectory;
    return {
      extraMetadata: {
        main: "main.js"
      },
      files: [{
        from: ".",
        filter: ["package.json"]
      }, {
        from: `${distDir}/main`
      }, {
        from: `${distDir}/renderer`
      }, {
        from: `${distDir}/renderer-dll`
      }],
      extraResources: [{
        from: "static",
        to: "static"
      }]
    };
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})(); exports.default = _default;
// __ts-babel@6.0.4
//# sourceMappingURL=electron-builder.js.map