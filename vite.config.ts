import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	],
	// Configuration pour la production
	build: {
		target: 'esnext',
		minify: 'terser'
	},
	// Configuration du serveur
	server: {
		port: 3001,
		host: '0.0.0.0'
	},
	preview: {
		port: 3001,
		host: '0.0.0.0'
	},
	// Configuration pour corriger les chemins d'assets
	base: '/',
	// Configuration pour éviter les problèmes de cache
	define: {
		'process.env.NODE_ENV': '"production"'
	}
});
