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
	traderId: null
};

let savedProfileIds: ProfileIds | null = null;
if (typeof window !== 'undefined') {
	savedProfileIds = localStorage.getItem('profileIds')
		? JSON.parse(localStorage.getItem('profileIds')!)
		: null;
}

const profileIds = writable<ProfileIds>(savedProfileIds || defaultValues);

if (typeof window !== 'undefined') {
	profileIds.subscribe(($profileIds) => {
		localStorage.setItem('profileIds', JSON.stringify($profileIds));
	});
}

export { profileIds };
