import {preload} from '../../src/index';


/**
 * @type {import('vite').UserConfig}
 */
const config = {
	build: {
		ssr: true,
		lib: {
			entry: 'index.ts',
			formats: ['cjs'],
		},
	},
	plugins: [
		preload.vite(),
	],
};

export default config;
