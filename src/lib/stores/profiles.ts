import { writable } from 'svelte/store';

export interface ProfileIds {
  clientId: number | null;
  deliveryPersonId: number | null;
  providerId: number | null;
  traderId: number | null;
}

const defaultValues: ProfileIds = {
  clientId: null,
  deliveryPersonId: null,
  providerId: null,
  traderId: null,
};

export const profileIds = writable<ProfileIds>(defaultValues);
