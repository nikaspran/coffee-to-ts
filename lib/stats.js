'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stats = void 0;
var totalFiles = void 0;

function prefix(withPrefix) {
	return function (str) {
		return withPrefix + str;
	};
}

function maybePrintStat(key, message) {
	var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	var _ref$includeFiles = _ref.includeFiles;
	var includeFiles = _ref$includeFiles === undefined ? false : _ref$includeFiles;

	if (stats[key].length) {
		console.log(' - ' + stats[key].length + ' ' + message);

		if (includeFiles) {
			stats[key].map(prefix('   * ')).forEach(function (fileName) {
				return console.log(fileName);
			});
		}
	}
}

module.exports = {
	init: function init(forFiles) {
		totalFiles = forFiles.length;
		stats = {
			success: [],
			failureRead: [],
			failureDecaffeinate: [],
			failureSelf: [],
			failureWrite: [],
			failureDelete: []
		};
	},
	report: function report(event, filename) {
		stats[event].push(filename);

		var totalReportedFiles = (0, _lodash2.default)(stats).values().map(_lodash2.default.property('length')).sum();
		if (totalReportedFiles === totalFiles) {
			console.log();
			console.log('Done converting ' + totalFiles + ':');
			maybePrintStat('success', 'converted successfully', { includeFiles: false });
			maybePrintStat('failureRead', 'failed to open', { includeFiles: true });
			maybePrintStat('failureDecaffeinate', 'failed to decaffeinate', { includeFiles: true });
			maybePrintStat('failureSelf', 'failed to convert to TypeScript', { includeFiles: true });
			maybePrintStat('failureWrite', 'failed to write .ts file', { includeFiles: true });
			maybePrintStat('failureDelete', 'failed to delete .coffee file', { includeFiles: true });
		}
	}
};