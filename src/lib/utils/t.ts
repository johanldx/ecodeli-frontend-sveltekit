import { derived, get } from 'svelte/store';
import { translations } from '$lib/stores/i18n';

export function t(key: string, params: Record<string, string> = {}) {
	return derived(translations, ($t) => {
		let text = $t[key] ?? `[${key}]`;

		for (const [paramKey, paramValue] of Object.entries(params)) {
			text = text.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
		}

		return text;
	});
}

export function tStatic(key: string, params: Record<string, string> = {}): string {
	// Récupération de la valeur du store synchroniquement
	let text = get(translations)[key] ?? `[${key}]`; // Si la traduction n'existe pas, retourne la clé

	// Remplacer les paramètres dynamiques dans la chaîne de traduction
	for (const [paramKey, paramValue] of Object.entries(params)) {
		text = text.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
	}

	return text; // Retourne la chaîne traduite
}
