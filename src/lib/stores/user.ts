import { writable } from 'svelte/store';

export const user = writable<{ email: string; id: string; name?: string } | null>(null);
