import {preload} from '../../src/index';


/**
 * @type {import('vite').UserConfig}
 */
const config = {
	root: __dirname,
	build: {
		minify: true,
		ssr: true,
		lib: {
			entry: 'index.ts',
			formats: ['es'],
		},
	},
	optimizeDeps: {
		disabled: true
	},
	plugins: [
		preload.vite(),
	],
};

export default config;
