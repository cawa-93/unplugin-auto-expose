import {renderer} from '../../src/index';


/**
 * @type {import('vite').UserConfig}
 */
const config = {
	plugins: [
		renderer.vite({
			preloadEntry: '../preload/index.ts',
		}),
	],
};

export default config;
