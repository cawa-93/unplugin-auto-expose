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
	base: './',
	build: {
		rollupOptions: {
			output: {
				entryFileNames: `[name].js`,
				chunkFileNames: `[name].js`,
				assetFileNames: `[name].[ext]`
			}
		}
	},
	optimizeDeps: {
		disabled: true
	},
};

export default config;
