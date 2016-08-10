'use strict';

var program = require('commander');
var glob = require('glob');
var decaffeinate = require('decaffeinate');
var fs = require('fs');
var jsToTs = require('./jsToTs');

program.parse(process.argv);

var filePattern = program.args[0];

glob(filePattern, {
	nonull: false,
	nodir: true
}, function (err, fileNames) {
	if (err) {
		return console.error(err);
	}

	fileNames.forEach(function (fileName) {
		fs.readFile(fileName, function (err, file) {
			if (err) {
				return console.log('Could not read ' + fileName + ': ' + err);
			}

			try {
				(function () {
					var coffeeScript = file.toString();
					var es6 = decaffeinate.convert(coffeeScript).code;
					var typescript = jsToTs(es6);
					var outputFileName = fileName.replace(/\.coffee$/, '.ts');

					fs.writeFile(outputFileName, typescript, function (err) {
						if (err) {
							return console.log('Could not write ' + outputFileName + ': ' + err);
						}

						fs.unlink(fileName, function (err) {
							if (err) {
								return console.log('Could not delete ' + fileName + ': ' + err);
							}

							console.log('Converted ' + fileName + ' => ' + outputFileName);
						});
					});
				})();
			} catch (err) {
				console.log('Could not convert ' + fileName + ':');
				console.error(err.stack);
			}
		});
	});
});