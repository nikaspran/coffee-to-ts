const program = require('commander');
const glob = require('glob');
const decaffeinate = require('decaffeinate');
const fs = require('fs');
const jsToTs = require('./jsToTs');
const _ = require('lodash');
const stats = require('./stats');

program
	.parse(process.argv);

const filePattern = program.args[0];

glob(filePattern, {
	nonull: false,
	nodir: true
}, function (err, fileNames) {
	if (err) {
		return console.error(err);
	}

	stats.init(fileNames);

	fileNames.forEach((fileName) => {
		fs.readFile(fileName, (err, file) => {
			if (err) {
				console.log(`Could not read ${fileName}: ${err}`);
				return stats.report('failureRead', fileName);
			}

			const coffeeScript = file.toString();
			let es6;
			try {
				es6 = decaffeinate.convert(coffeeScript).code;
			} catch (err) {
				console.log(`Could not decaffeinate ${fileName}: ${err}`);
				return stats.report('failureDecaffeinate', fileName);
			}

			let typescript;
			try {
				typescript = jsToTs(es6);
			} catch (err) {
				console.log(`Could not convert ${fileName}:`);
				console.error(err.stack);
				return stats.report('failureSelf', fileName);
			}

			const outputFileName = fileName.replace(/\.coffee$/, '.ts');
			fs.writeFile(outputFileName, typescript, function (err) {
				if (err) {
					console.log(`Could not write ${outputFileName}: ${err}`);
					return stats.report('failureWrite', fileName);
				}

				fs.unlink(fileName, function (err) {
					if (err) {
						console.log(`Could not delete ${fileName}: ${err}`);
						return stats.report('failureDelete', fileName);
					}

					console.log(`Converted ${fileName} => ${outputFileName}`);
					return stats.report('success', fileName);
				});
			});
		})
	});
});
