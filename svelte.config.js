import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	// We will use adapter-static to run the app in a SPA congiguration
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		})
	},

	// Hot module reloading causes issues where websocket connections are
	// not closed properly. This might cause problems when running the app
	vitePlugin: {
		hot: false
	}
};

export default config;
