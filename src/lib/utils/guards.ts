import { goto } from '$app/navigation';
import { notifications } from '$lib/stores/notifications';
import { checkAuth } from '$lib/utils/auth';
import { tStatic } from './t';
import { saveCurrentUrl } from '$lib/stores/fallbackUrl';
import { profileIds } from '$lib/stores/profiles';
import { get } from 'svelte/store';
import { fetchFromAPI } from './api';
import { accessToken } from '$lib/stores/token';

export async function guardRoute(redirectTo = '/auth/login') {
	const isValid = await checkAuth();

	if (!isValid) {
		saveCurrentUrl();
		
		const message = tStatic('api_responses.auth.global.session_expired');
		notifications.error(message);
		goto(redirectTo);
		return false;
	}

	return true;
}

export async function guardProfileAccess(profileType: 'clients' | 'delivery-persons' | 'providers' | 'traders') {
	// Vérifier d'abord l'authentification
	const isAuthenticated = await guardRoute();
	if (!isAuthenticated) return false;

	// Récupérer les IDs de profil depuis le store
	const profiles = get(profileIds);
	
	// Vérifier si l'ID du profil demandé existe dans le store
	let hasProfileId = false;
	switch (profileType) {
		case 'clients':
			hasProfileId = profiles.clientId !== null;
			break;
		case 'delivery-persons':
			hasProfileId = profiles.deliveryPersonId !== null;
			break;
		case 'providers':
			hasProfileId = profiles.providerId !== null;
			break;
		case 'traders':
			hasProfileId = profiles.traderId !== null;
			break;
	}

	// Si l'ID n'existe pas dans le store, vérifier via l'API
	if (!hasProfileId) {
		try {
			const response = await fetchFromAPI<{ id: number }>(`/auth/me/${profileType}`, {
				headers: { Authorization: `Bearer ${get(accessToken)}` }
			});
			
			// Si la requête réussit, l'utilisateur a le profil
			// Mettre à jour le store avec l'ID récupéré
			const profileId = response.id;
			const updatedProfiles = { ...profiles };
			
			switch (profileType) {
				case 'clients':
					updatedProfiles.clientId = profileId;
					break;
				case 'delivery-persons':
					updatedProfiles.deliveryPersonId = profileId;
					break;
				case 'providers':
					updatedProfiles.providerId = profileId;
					break;
				case 'traders':
					updatedProfiles.traderId = profileId;
					break;
			}
			
			profileIds.set(updatedProfiles);
			return true;
		} catch (error) {
			// L'utilisateur n'a pas ce type de profil
			const profileNames = {
				'clients': 'client',
				'delivery-persons': 'livreur',
				'providers': 'prestataire',
				'traders': 'commerçant'
			};
			
			const profileName = profileNames[profileType];
			notifications.error(`Vous n'avez pas accès à l'espace ${profileName}. Veuillez créer un profil ${profileName} pour continuer.`);
			goto('/auth/space');
			return false;
		}
	}

	return true;
}
