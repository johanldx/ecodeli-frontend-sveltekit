<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import { notifications } from '$lib/stores/notifications';
	import { t, tStatic } from '$lib/utils/t';
	import { fetchFromAPI } from '$lib/utils/api';
	import { accessToken } from '$lib/stores/token';
	import { get } from 'svelte/store';

	const VALID_NAMESPACES = ['clients', 'delivery-persons', 'providers', 'traders'];
	const VALID_STATUSES = ['pending', 'approved', 'rejected'] as const;

	let namespace = '';
	let status: 'pending' | 'approved' | 'rejected' | null = null;
	let loading = true;
	let profileExists = false;

	let formData: Record<string, string> = {};

	onMount(async () => {
		namespace = $page.params.namespace;

		if (!VALID_NAMESPACES.includes(namespace)) {
			goto('/auth/space');
			return;
		}

		try {
			const data = await fetchFromAPI<any>(`/${namespace}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` },
			});

			status = data.status;
			profileExists = true;

			if (status === 'approved') {
				goto(`/app/${namespace}`);
				return;
			}
		} catch (error: any) {
			if (error.status === 400) {
				const message = tStatic('api_responses.auth.account.incorrect_new_password');
				notifications.error(message);
			} else if (error.status === 401) {
				const message = tStatic('api_responses.auth.account.incorrect_old_password');
				notifications.error(message);
			} else if (error.status === 404) {
				const message = tStatic('api_responses.auth.global.user_not_found');
				notifications.error(message);
			} else {
				const message = tStatic('api_responses.auth.global.unknown_error');
				notifications.error(message);
			}
		} finally {
			loading = false;
		}
	});

	const handleSubmit = async () => {
		try {
			const res = await fetch(`/api/namespace/${namespace}/request-access`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (!res.ok) throw new Error('Échec de la demande');

			notifications.success(tStatic('api_responses.namespace.request_success'));
			status = 'pending';
		} catch (err) {
			notifications.error(tStatic('api_responses.namespace.request_error'));
		}
	};
</script>

<GuardWrapper>
	{#if loading}
		<div class="fixed inset-0 flex items-center justify-center bg-neutral z-50">
			<span class="loading loading-spinner loading-lg text-primary"></span>
	  	</div>

	{:else if status === 'pending'}
		<!-- Demande en attente -->
		<div class="text-center p-4 max-w-lg mx-auto">
			<img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto mb-4" alt="">
			<h1 class="text-2xl font-bold mb-4">{t(`namespace.${namespace}.waiting_title`)}</h1>
			<p>{t(`namespace.${namespace}.waiting_message`)}</p>
		</div>

	{:else}
		<!-- Cas rejected ou profil inexistant -->
		<div class="text-center p-4 max-w-lg mx-auto">
			<img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto mb-4" alt="">
			<h1 class="text-2xl font-bold mb-6">{namespace} – {t(`namespace.${namespace}.title`)}</h1>

			{#if status === 'rejected'}
				<p class="text-error mb-4">{t('namespace.rejected_message')}</p>
			{/if}

			<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
				{#if namespace === 'clients'}
					<input type="text" class="input w-full" placeholder="Nom complet" bind:value={formData.fullname} required />
					<input type="email" class="input w-full" placeholder="Email pro" bind:value={formData.email} required />

				{:else if namespace === 'providers'}
					<input type="text" class="input w-full" placeholder="Entreprise" bind:value={formData.company} required />
					<input type="url" class="input w-full" placeholder="Site web" bind:value={formData.website} />

				{:else if namespace === 'traders'}
					<input type="text" class="input w-full" placeholder="Pseudo Discord" bind:value={formData.discord} required />
					<select class="select w-full" bind:value={formData.role} required>
						<option disabled selected>Choisissez un rôle</option>
						<option value="moderateur">Modérateur</option>
						<option value="partenaire">Partenaire</option>
					</select>

				{:else if namespace === 'delivery-persons'}
					<textarea class="textarea w-full" placeholder="Décrivez votre projet" bind:value={formData.project} required></textarea>
					<input type="text" class="input w-full" placeholder="Contact principal" bind:value={formData.contact} required />
				{/if}

				<input type="submit" class="btn btn-primary w-full" value={t('namespace.submit')} />
			</form>
		</div>
	{/if}
</GuardWrapper>
