import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Configuration pour la production
			out: 'build',
			precompress: true, // Compression gzip/brotli
			envPrefix: 'ECODELI_', // Préfixe pour les variables d'environnement
			polyfill: true // Polyfills pour les navigateurs plus anciens
		}),
		// Configuration pour la production
		paths: {
			base: process.env.ECODELI_BASE_PATH || ''
		}
	}
};

export default config;
