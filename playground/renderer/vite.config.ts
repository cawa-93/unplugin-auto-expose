import {renderer} from '../../src';


/**
 * @type {import('vite').UserConfig}
 */
const config = {
	root: __dirname,
	plugins: [
		renderer.vite({
			preloadEntry: './preload/index.ts',
		}),
	],
	optimizeDeps: {
		disabled: true
	},
};

export default config;
