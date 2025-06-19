import { writable } from 'svelte/store';

export const fallbackUrl = writable<string>('');

// Fonction pour sauvegarder l'URL actuelle
export function saveCurrentUrl() {
	if (typeof window !== 'undefined') {
		fallbackUrl.set(window.location.pathname + window.location.search);
	}
}

// Fonction pour récupérer et nettoyer l'URL de fallback
export function getAndClearFallbackUrl(): string {
	let url = '';
	fallbackUrl.update(currentUrl => {
		url = currentUrl;
		return '';
	});
	return url;
} 