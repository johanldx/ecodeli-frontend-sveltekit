import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
	plugins: [
		sveltekit(),
		monacoEditorPlugin({
			publicPath: 'monaco-editor'
		})
	],
	// Configuration pour la production
	build: {
		target: 'esnext',
		minify: 'terser',
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['svelte', '@sveltejs/kit'],
					ui: ['daisyui', 'tailwindcss']
				}
			}
		}
	},
	// Optimisations pour la production
	server: {
		port: 3000,
		host: '0.0.0.0'
	},
	preview: {
		port: 3000,
		host: '0.0.0.0'
	}
});
