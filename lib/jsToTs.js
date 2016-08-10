'use strict';

var _loadPlugins = require('./babel/loadPlugins');

var _babelCore = require('babel-core');

var babel = _interopRequireWildcard(_babelCore);

var _parser = require('babylon/lib/parser');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

module.exports = function jsToTs(js) {
	return babel.transform(js, {
		plugins: (0, _loadPlugins.generatePlugins)()
	}).code;
};