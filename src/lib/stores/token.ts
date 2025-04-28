import { writable } from 'svelte/store';

function getInitialAccessToken(): string {
	return typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
}

function getInitialRefreshToken(): string {
	return typeof window !== 'undefined' ? localStorage.getItem('refresh_token') || '' : '';
}

export const accessToken = writable<string>(getInitialAccessToken());
export const refreshToken = writable<string>(getInitialRefreshToken());

if (typeof window !== 'undefined') {
	accessToken.subscribe((value) => {
		if (value) {
			localStorage.setItem('access_token', value);
		} else {
			localStorage.removeItem('access_token');
		}
	});

	refreshToken.subscribe((value) => {
		if (value) {
			localStorage.setItem('refresh_token', value);
		} else {
			localStorage.removeItem('refresh_token');
		}
	});
}
