import { writable, derived } from 'svelte/store';

export const translations = writable<Record<string, string>>({});
export const translationsReady = derived(translations, ($t) => Object.keys($t).length > 0);

export const currentLang = writable(
  typeof localStorage !== 'undefined' ? localStorage.getItem('lang') || 'fr' : 'fr'
);
