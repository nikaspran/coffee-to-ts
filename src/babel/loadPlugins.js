import {plugins} from 'babylon/lib/parser';
import fs from 'fs';
import _ from 'lodash';

const pluginsToLoad = _(fs.readdirSync(__dirname))
	.reject((plugin) => plugin.startsWith('loadPlugins') || plugin.startsWith('common'))
	.map((plugin) => plugin.split('.').shift())
	.map((pluginName) => {
		return {
			[pluginName]: require(`./${pluginName}`).parser
		}
	})
	.reduce(_.assign);

Object.assign(plugins, pluginsToLoad);

export function generatePlugins() {
	return [
		require.resolve('./loadPlugins'),
		..._.keys(pluginsToLoad).map((plugin) => require.resolve(`./${plugin}`))
	];
}

export default function addParserPlugins() {
	return {
		manipulateOptions(opts, parserOpts) {
			parserOpts.plugins.push('classProperties');
			parserOpts.plugins.push(..._.keys(pluginsToLoad));
		}
	};
}
