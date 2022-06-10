import { UserConfig } from "vite";

export default <UserConfig>{
	root: __dirname,
	build: {
		ssr: true,
		lib: {
			entry: 'index.ts',
			formats: ['cjs'],
		},
	},
	optimizeDeps: {
		disabled: true
	},
};
