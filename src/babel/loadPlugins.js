import {plugins} from 'babylon/lib/parser';
import fs from 'fs';
import _ from 'lodash';

const pluginsToLoad = _(fs.readdirSync(__dirname))
	.filter((plugin) => !plugin.startsWith('loadPlugins'))
	.map((plugin) => plugin.split('.').shift())
	.map((pluginName) => {
		return {
			[pluginName]: require(`./${pluginName}`).parser
		}
	})
	.reduce(_.merge);

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
			parserOpts.plugins.push(..._.keys(pluginsToLoad));
		}
	};
}
