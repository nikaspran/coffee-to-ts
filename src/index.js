const program = require('commander');
const glob = require('glob');
const decaffeinate = require('decaffeinate');
const fs = require('fs');
const jsToTs = require('./jsToTs');

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

	fileNames.forEach((fileName) => {
		fs.readFile(fileName, (err, file) => {
			if (err) {
				return console.log(`Could not read ${fileName}: ${err}`);
			}

			try {
				const coffeeScript = file.toString();
				const es6 = decaffeinate.convert(coffeeScript).code;
				const typescript = jsToTs(es6);
				const outputFileName = fileName.replace(/\.coffee$/, '.ts');

				fs.writeFile(outputFileName, typescript, function (err) {
					if (err) {
						return console.log(`Could not write ${outputFileName}: ${err}`);
					}

					fs.unlink(fileName, function (err) {
						if (err) {
							return console.log(`Could not delete ${fileName}: ${err}`);
						}

						console.log(`Converted ${fileName} => ${outputFileName}`);
					});
				});
			} catch (err) {
				console.log(`Could not convert ${fileName}:`);
				console.error(err.stack);
			}
		})
	});
});
