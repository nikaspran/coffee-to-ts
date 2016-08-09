import {generatePlugins} from './babel/loadPlugins';
import * as babel from 'babel-core';
import {plugins} from 'babylon/lib/parser';

module.exports = function jsToTs(js) {
	return babel.transform(js, {
		plugins: generatePlugins()
	}).code;
};
