import {generatePlugins} from './babel/loadPlugins';
import * as babel from 'babel-core';
import {plugins} from 'babylon/lib/parser';

function compactMultipleNewlines(str) {
	return str.replace(/\n\s*\n\s*\n/g, '\n\n');
}

function ensureLastNewline(str) {
	return str.replace(/([^\n])$/, '$1\n');
}

module.exports = function jsToTs(js) {
	const ts = babel.transform(js, {
		plugins: generatePlugins()
	}).code;

	return ensureLastNewline(compactMultipleNewlines(ts));
};
