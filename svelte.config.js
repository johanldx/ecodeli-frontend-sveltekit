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
			precompress: false, // Désactiver la compression pour éviter les problèmes
			envPrefix: '', // Pas de préfixe pour simplifier
			polyfill: false // Désactiver les polyfills pour éviter les conflits
		}),
		// Configuration des chemins pour éviter les boucles
		paths: {
			base: '',
			relative: true
		}
	}
};

export default config;
