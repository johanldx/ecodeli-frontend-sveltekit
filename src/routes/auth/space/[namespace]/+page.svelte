<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import { notifications } from '$lib/stores/notifications';
	import { t, tStatic } from '$lib/utils/t';
	import { fetchFromAPI } from '$lib/utils/api';
	import { accessToken } from '$lib/stores/token';
	import { user, type User } from '$lib/stores/user';
	import { profileIds } from '$lib/stores/profiles';
	
	function waitUntil(conditionFn: () => boolean, interval = 50): Promise<void> {
		return new Promise((resolve) => {
			const check = () => {
				if (conditionFn()) resolve();
				else setTimeout(check, interval);
			};
			check();
		});
	}
	const VALID_NAMESPACES = ['clients', 'delivery-persons', 'providers', 'traders'];

	let namespace = '';
	let status: 'pending' | 'approved' | 'rejected' | null = null;
	let loading = true;
	let formData: Record<string, string | File> = {};
	let currentUser: User;

	onMount(async () => {
		namespace = $page.params.namespace;

		await waitUntil(() => !!get(user) && !!get(accessToken));
		
		const currentUser = get(user)!;
		const token = get(accessToken)!;


		if (!VALID_NAMESPACES.includes(namespace)) {
			goto('/auth/space');
			return;
		}

		try {
			if (namespace === 'clients') {
				const res = await fetchFromAPI<any>('/auth/me/clients', {
					method: 'GET',
					headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				});

				profileIds.update((ids) => ({ ...ids, clientId: res.id }));

				if (res.onboarding === true) {
					goto('/app/clients');
					return;
				}
			} else {
				const data = await fetchFromAPI<any>(`/auth/me/${namespace}`, {
					method: 'GET',
					headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				});

				status = data.status;

				profileIds.update((ids) => {
					switch (namespace) {
						case 'delivery-persons':
							return { ...ids, deliveryPersonId: data.id };
						case 'providers':
							return { ...ids, providerId: data.id };
						case 'traders':
							return { ...ids, traderId: data.id };
						default:
							return ids;
					}
				});

				if (status === 'approved') {
					goto(`/app/${namespace}`);
					return;
				}
			}
		} catch (error: any) {
			if (namespace === 'clients' && error?.status === 404) {
				await fetchFromAPI('/clients', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
					body: JSON.stringify({ user_id: currentUser.id })
				});
			} else {
				notifications.error(tStatic('api_responses.auth.global.unknown_error'));
			}
		} finally {
			loading = false;
		}
	});

	const handleSubmit = async () => {
		try {
			await waitUntil(() => !!get(user) && !!get(accessToken));

			const currentUser = get(user)!;
			const token = get(accessToken)!;
			const profiles = get(profileIds);

			if (namespace === 'clients') {
				await fetchFromAPI(`/clients/${profiles.clientId}/onboarding`, {
					method: 'PATCH',
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
				notifications.success(tStatic('api_responses.namespace.request_success'));
				goto('/app/clients');
				return;
			}

			const isRejected = status === 'rejected';
			const method = isRejected ? 'PATCH' : 'POST';
			const profileId = {
				'delivery-persons': profiles.deliveryPersonId,
				providers: profiles.providerId,
				traders: profiles.traderId
			}[namespace];

			const endpoint = isRejected
				? `/${namespace}/${profileId}`
				: `/${namespace}`;

			// Création du FormData
			const form = new FormData();
			form.append('user_id', String(currentUser.id));

			if (namespace === 'delivery-persons') {
				form.append('bank_account', String(formData.bank_account || ''));
				if (formData.identity_card_document instanceof File) {
					form.append('identity_card_document', formData.identity_card_document);
				}
				if (formData.driver_license_document instanceof File) {
					form.append('driver_license_document', formData.driver_license_document);
				}
			} else if (namespace === 'providers') {
				form.append('company', String(formData.company || ''));
				form.append('website', String(formData.website || ''));
			} else if (namespace === 'traders') {
				form.append('discord', String(formData.discord || ''));
				form.append('role', String(formData.role || ''));
			}

			console.log('Contenu FormData :');
			for (const pair of form.entries()) {
				console.log(pair[0], pair[1]);
			}


			await fetchFromAPI(endpoint, {
				method,
				headers: {
					Authorization: `Bearer ${token}`
				},
				body: form
			});

			notifications.success(tStatic('api_responses.namespace.request_success'));
			status = 'pending';
		} catch (err) {
			console.error(err);
			notifications.error(tStatic('api_responses.namespace.request_error'));
		}
	};

	const title = t(`auth.space_validation.${$page.params.namespace}.title`);
	const subtitle = t(`auth.space_validation.${$page.params.namespace}.subtitle`);
	const button = t(`auth.space_validation.${$page.params.namespace}.button`);
	const rejected = t(`auth.space_validation.${$page.params.namespace}.rejected`);

	const pending_title = t(`auth.space_validation.pending.title`);
	const pending_subtitle = t(`auth.space_validation.pending.subtitle`);
	const pending_back_link = t(`auth.space_validation.pending.back_link`);
</script>

<GuardWrapper>
	{#if loading}
		<div class="fixed inset-0 flex items-center justify-center bg-neutral z-50">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>

	{:else if status === 'pending'}
		<div class="text-center p-4 max-w-lg mx-auto">
			<img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto mb-4" alt="">
			<h1 class="mb-6 mt-10 text-2xl font-bold">{$pending_title}</h1>
			<p>{$pending_subtitle}</p>
			<a class="btn btn-primary mt-10" href="/auth/space">{$pending_back_link}</a>
		</div>

	{:else}
		<div class="text-center p-4 max-w-lg mx-auto">
			<img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto mb-4" alt="">
			<h1 class="text-2xl font-bold mb-6 mt-10">{$title}</h1>
			{#if status === 'rejected'}
				<div class="border border-error bg-error/10 text-error p-4 rounded-lg mb-4">
					<p class="font-medium">{$rejected}</p>
				</div>
			{/if}
			<p class="my-5">{$subtitle}</p>

			<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
				{#if namespace === 'clients'}
					<iframe class="w-full aspect-video mx-auto rounded-xl shadow-md"
						src="https://www.youtube.com/embed/MV_3Dpw-BRY?si=5TAQ3lDVCYVfbG7G&amp;controls=0"
						title="Vidéo d'onboarding" frameborder="0" allowfullscreen></iframe>

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
					<label class="form-control w-full my-5 block">
						<div class="label">
							<span class="label-text">IBAN</span>
						</div>
						<input
							type="text"
							class="input w-full"
							placeholder="IBAN / RIB"
							bind:value={formData.bank_account}
							required
						/>
					</label>
				
					<label class="form-control w-full my-5 block">
						<div class="label">
							<span class="label-text">Carte d'identité (PDF, JPG, PNG)</span>
						</div>
						<input
							type="file"
							accept=".pdf,.jpg,.jpeg,.png"
							class="file-input w-full"
							on:change={(e) => {
								const input = e.target as HTMLInputElement;
								if (input?.files?.[0]) {
									formData.identity_card_document = input.files[0];
								}
							}}	
							required
						/>
					</label>
				
					<label class="form-control w-full my-5 block">
						<div class="label">
							<span class="label-text">Permis de conduire (PDF, JPG, PNG)</span>
						</div>
						<input
							type="file"
							accept=".pdf,.jpg,.jpeg,.png"
							class="file-input w-full"
							on:change={(e) => {
								const input = e.target as HTMLInputElement;
								if (input?.files?.[0]) {
									formData.driver_license_document = input.files[0];
								}
							}}							
							required
						/>
					</label>
				{/if}

				<input type="submit" class="btn btn-primary w-full mt-5" value={$button} />
			</form>
		</div>
	{/if}
</GuardWrapper>