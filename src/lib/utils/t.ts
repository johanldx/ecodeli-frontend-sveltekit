import { derived } from 'svelte/store';
import { translations } from '$lib/stores/i18n';

export function t(key: string) {
  return derived(translations, ($t) => $t[key] ?? `[${key}]`);
}

