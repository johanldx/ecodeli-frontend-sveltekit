<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fetchFromAPI } from '$lib/utils/api';
	import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
	import { notifications } from '$lib/stores/notifications';
	import { t } from '$lib/utils/t';
	import { saveCurrentUrl } from '$lib/stores/fallbackUrl';

	let loading = true;
	let hasAccess = false;
	let error = false;

	const access_denied_title = t('admin.access_denied.title');
	const access_denied_message = t('admin.access_denied.message');
	const back_to_auth_button = t('admin.access_denied.back_to_auth');

	onMount(async () => {
		try {
			// Vérifier si l'utilisateur est connecté et a les droits admin
			const response = await fetchFromAPI('/auth/check-admin', {
				method: 'GET',
				headers: { 
					'Content-Type': 'application/json', 
					Authorization: `Bearer ${get(accessToken)}` 
				}
			});

			// Si on arrive ici, l'utilisateur a les droits admin
			hasAccess = true;
		} catch (err: any) {
			console.error('Erreur d\'accès admin:', err);
			error = true;
			
			// Si c'est une erreur 401, rediriger vers la page de connexion
			if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
				// Sauvegarder l'URL actuelle avant redirection
				saveCurrentUrl();
				notifications.error('Session expirée. Veuillez vous reconnecter.');
				goto('/auth/login');
				return;
			}
		} finally {
			loading = false;
		}
	});

	function goToAuth() {
		// Sauvegarder l'URL actuelle avant redirection
		saveCurrentUrl();
		goto('/auth/login');
	}
</script>

{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else if error}
	<div class="bg-base-content flex min-h-screen w-full items-center justify-center px-4">
		<div class="card bg-base-200 min-w-md max-w-2xl p-10 shadow-xl">
			<div class="text-center">
				<a href="/"><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt="" /></a>
				
				<div class="mt-10">
					<h1 class="text-2xl font-semibold mb-4">{$access_denied_title}</h1>
					<p class="text-gray-600 mb-8">{$access_denied_message}</p>
					
					<button 
						class="btn btn-primary w-full" 
						on:click={goToAuth}
					>
						{$back_to_auth_button}
					</button>
				</div>
			</div>
		</div>
	</div>
{:else if hasAccess}
	<slot />
{/if} 