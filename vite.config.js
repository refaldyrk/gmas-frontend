import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		host: 'gmas.efal.lol',
		port: 2245, // Your server port
		hmr: {
			host: 'gmas.efal.lol',
			port: 2245 // HMR port
		},
		cors: true
	},
	plugins: [sveltekit()]
});
