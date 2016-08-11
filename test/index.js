import path from 'path';
import fs from 'fs';
import assert from 'assert';
import jsToTs from '../src/jsToTs';

function trim(str) {
	return str.replace(/^\s+|\s+$/, '');
}

const DO_NOT_RUN = [
	// 'component1'
];
const ONLY_RUN = [
	// 'jasmineTests'
];

describe('', () => {
	const fixturesDir = path.join(__dirname, 'fixtures');
	fs.readdirSync(fixturesDir).map((caseName) => {
		const testName = `should convert ${caseName.split('-').join(' ')}`;

		if (DO_NOT_RUN.some((prefix) => caseName.startsWith(prefix))) {
			xit(testName, () => {});
			return;
		}

		const testCaseType = ONLY_RUN.some((prefix) => caseName.startsWith(prefix)) ? it.only.bind(it) : it;

		testCaseType(testName, () => {
			const fixtureDir = path.join(fixturesDir, caseName);
			const actualPath = path.join(fixtureDir, 'actual.js');
			const actual = jsToTs(fs.readFileSync(actualPath).toString());

			const expected = fs.readFileSync(
				path.join(fixtureDir, 'expected.ts')
			).toString();

			assert.equal(trim(actual), trim(expected));
		});
	});
});
