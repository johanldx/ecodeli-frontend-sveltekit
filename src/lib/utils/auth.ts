import { goto } from '$app/navigation';
import { user, type User } from '$lib/stores/user';
import { accessToken, refreshToken as refreshTokenStore } from '$lib/stores/token';
import { fetchFromAPI } from '$lib/utils/api';
import { get } from 'svelte/store';
import { jwtDecode } from 'jwt-decode';
import { profileIds } from '$lib/stores/profiles';

interface JwtPayload {
	exp: number;
	email: string;
	sub: number;
}

export async function checkAuth(): Promise<boolean> {
	if (typeof window === 'undefined') return false;

	// Récupérer le token depuis le store
	let token = get(accessToken);
	if (!token) {
		clearTokens();
		user.set(null);
		return false;
	}

	try {
		const decoded: JwtPayload = jwtDecode(token);
		const now = Date.now() / 1000;

		if (decoded.exp && decoded.exp - now < 300) {
			token = await refreshToken();
		}

		const userInfo = await fetchFromAPI<User>('/auth/me', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		user.set(userInfo);
		return true;
	} catch (err) {
		clearTokens();
		user.set(null);
		goto('/auth/login');
		return false;
	}
}

export function clearTokens() {
	// Mettre à jour le store pour supprimer les tokens
	accessToken.set('');
	refreshTokenStore.set('');
}

// Connexion
export async function login(email: string, password: string) {
	const data = await fetchFromAPI<{ access_token: string; refresh_token: string }>('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ email, password })
	});

	accessToken.set(data.access_token);
	refreshTokenStore.set(data.refresh_token);

	return data;
}

// Inscription
export async function register(
	email: string,
	password: string,
	first_name: string,
	last_name: string
) {
	const data = await fetchFromAPI<{ access_token: string; refresh_token: string }>(
		'/auth/register',
		{
			method: 'POST',
			body: JSON.stringify({ email, password, first_name, last_name })
		}
	);

	accessToken.set(data.access_token);
	refreshTokenStore.set(data.refresh_token);

	return data;
}

// Rafraîchir le token
export async function refreshToken(): Promise<string> {
	const currentRefreshToken = get(refreshTokenStore);
	if (!currentRefreshToken) throw new Error('No refresh token available.');

	const data = await fetchFromAPI<{ access_token: string }>('/auth/refresh', {
		method: 'POST',
		body: JSON.stringify({ refresh_token: currentRefreshToken })
	});

	accessToken.set(data.access_token);
	return data.access_token;
}

// Mot de passe oublié
export async function forgotPassword(email: string) {
	return await fetchFromAPI<{ message: string }>('/auth/forgot-password', {
		method: 'POST',
		body: JSON.stringify({ email })
	});
}

// Réinitialisation du mot de passe
export async function resetPassword(resetPasswordToken: string, newPassword: string) {
	return await fetchFromAPI<{ message: string }>('/auth/reset-password', {
		method: 'POST',
		body: JSON.stringify({ resetPasswordToken, password: newPassword })
	});
}

export async function updateAllProfiles() {
	const token = get(accessToken);
	const namespaces = ['clients', 'delivery-persons', 'providers', 'traders'];

	for (const namespace of namespaces) {
		try {
			const res = await fetchFromAPI<any>(`/auth/me/${namespace}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
			});

			if (res && res.id) {
				profileIds.update((ids) => {
					let updatedIds = { ...ids };

					switch (namespace) {
						case 'clients':
							updatedIds.clientId = res.id;
							break;
						case 'delivery-persons':
							updatedIds.deliveryPersonId = res.id;
							break;
						case 'providers':
							updatedIds.providerId = res.id;
							break;
						case 'traders':
							updatedIds.traderId = res.id;
							break;
					}

					// Met à jour localStorage avec les nouvelles valeurs
					if (typeof window !== 'undefined') {
						localStorage.setItem('profileIds', JSON.stringify(updatedIds));
					}

					return updatedIds;
				});
			}
		} catch (error) {
			console.error(`Error fetching ${namespace}:`, error);
		}
	}
}
