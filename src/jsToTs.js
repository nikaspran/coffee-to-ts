import {generatePlugins} from './babel/loadPlugins';
import * as babel from 'babel-core';
import {plugins} from 'babylon/lib/parser';

module.exports = function jsToTs(js) {
	return babel.transform(js, {
		plugins: generatePlugins()
	}).code;
	let previousResult;
	let result = js;
	do {
		previousResult = result;
		result = previousResult
			.replace(/import templateUrl from ('.+');/g, 'const templateUrl = <string> require($1);')
			.replace(/import (.+) from ('.+');/g, 'import $1 = require($2);')
	} while (result !== previousResult);

	return result;
};
