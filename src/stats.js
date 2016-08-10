'use strict';
import _ from 'lodash';

let stats;
let totalFiles;

function prefix(withPrefix) {
	return (str) => withPrefix + str;
}

function maybePrintStat(key, message, {includeFiles = false} = {}) {
	if (stats[key].length) {
		console.log(` - ${stats[key].length} ${message}`);

		if (includeFiles) {
			stats[key]
				.map(prefix('   * '))
				.forEach((fileName) => console.log(fileName));
		}
	}
}

module.exports = {
	init(forFiles) {
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

	report(event, filename) {
		stats[event].push(filename);

		const totalReportedFiles = _(stats).values().map(_.property('length')).sum();
		if (totalReportedFiles === totalFiles) {
			console.log();
			console.log(`Done converting ${totalFiles}:`);
			maybePrintStat('success', 'converted successfully', {includeFiles: false});
			maybePrintStat('failureRead', 'failed to open', {includeFiles: true});
			maybePrintStat('failureDecaffeinate', 'failed to decaffeinate', {includeFiles: true});
			maybePrintStat('failureSelf', 'failed to convert to TypeScript', {includeFiles: true});
			maybePrintStat('failureWrite', 'failed to write .ts file', {includeFiles: true});
			maybePrintStat('failureDelete', 'failed to delete .coffee file', {includeFiles: true});
		}
	}
};
