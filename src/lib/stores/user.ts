import { writable } from 'svelte/store';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  active: boolean;
  administrator: boolean;
  created_at: string;
  updated_at: string;
}

export const user = writable<User | null>(null);
