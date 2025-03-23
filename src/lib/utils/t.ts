import { derived } from 'svelte/store';
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


