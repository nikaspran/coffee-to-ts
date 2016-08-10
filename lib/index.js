'use strict';

var program = require('commander');
var glob = require('glob');
var decaffeinate = require('decaffeinate');
var fs = require('fs');
var jsToTs = require('./jsToTs');
var _ = require('lodash');
var stats = require('./stats');

program.parse(process.argv);

var filePattern = program.args[0];

glob(filePattern, {
	nonull: false,
	nodir: true
}, function (err, fileNames) {
	if (err) {
		return console.error(err);
	}

	stats.init(fileNames);

	fileNames.forEach(function (fileName) {
		fs.readFile(fileName, function (err, file) {
			if (err) {
				console.log('Could not read ' + fileName + ': ' + err);
				return stats.report('failureRead', fileName);
			}

			var coffeeScript = file.toString();
			var es6 = void 0;
			try {
				es6 = decaffeinate.convert(coffeeScript).code;
			} catch (err) {
				console.log('Could not decaffeinate ' + fileName + ': ' + err);
				return stats.report('failureDecaffeinate', fileName);
			}

			var typescript = void 0;
			try {
				typescript = jsToTs(es6);
			} catch (err) {
				console.log('Could not convert ' + fileName + ':');
				console.error(err.stack);
				return stats.report('failureSelf', fileName);
			}

			var outputFileName = fileName.replace(/\.coffee$/, '.ts');
			fs.writeFile(outputFileName, typescript, function (err) {
				if (err) {
					console.log('Could not write ' + outputFileName + ': ' + err);
					return stats.report('failureWrite', fileName);
				}

				fs.unlink(fileName, function (err) {
					if (err) {
						console.log('Could not delete ' + fileName + ': ' + err);
						return stats.report('failureDelete', fileName);
					}

					console.log('Converted ' + fileName + ' => ' + outputFileName);
					return stats.report('success', fileName);
				});
			});
		});
	});
});