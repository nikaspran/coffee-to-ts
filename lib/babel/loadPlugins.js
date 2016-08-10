'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.generatePlugins = generatePlugins;
exports.default = addParserPlugins;

var _parser = require('babylon/lib/parser');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var pluginsToLoad = (0, _lodash2.default)(_fs2.default.readdirSync(__dirname)).reject(function (plugin) {
	return plugin.startsWith('loadPlugins') || plugin.startsWith('common');
}).map(function (plugin) {
	return plugin.split('.').shift();
}).map(function (pluginName) {
	return _defineProperty({}, pluginName, require('./' + pluginName).parser);
}).reduce(_lodash2.default.assign);

Object.assign(_parser.plugins, pluginsToLoad);

function generatePlugins() {
	return [require.resolve('./loadPlugins')].concat(_toConsumableArray(_lodash2.default.keys(pluginsToLoad).map(function (plugin) {
		return require.resolve('./' + plugin);
	})));
}

function addParserPlugins() {
	return {
		manipulateOptions: function manipulateOptions(opts, parserOpts) {
			var _parserOpts$plugins;

			(_parserOpts$plugins = parserOpts.plugins).push.apply(_parserOpts$plugins, _toConsumableArray(_lodash2.default.keys(pluginsToLoad)));
		}
	};
}