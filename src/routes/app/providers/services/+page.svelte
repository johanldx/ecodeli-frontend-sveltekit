<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
	import { profileIds } from '$lib/stores/profiles';
	import { fetchFromAPI } from '$lib/utils/api';
	import { notifications } from '$lib/stores/notifications';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { t } from '$lib/utils/t';

	type ServiceType = {
		id: number;
		name: string;
	};

	let serviceTypes: ServiceType[] = [];
	let authorizedTypeIds: number[] = [];
	let authorizedServicesWithPrices: { id: number; name: string; price: number }[] = [];

	let showDeleteModal = false;
	let title = '';
	let description = '';
	let selectedTypeId: number = -1;
	let files: File[] = [];
	let imageUrls: string[] = [];
	let isSubmitting = false;
	let showModal = false;

	type PersonalServiceAd = {
		id: number;
		title: string;
		description: string;
		imageUrls: string[];
		type: { id: number; name: string };
		typeId: number;
		status: string;
		createdAt: string;
	};
	let ads: PersonalServiceAd[] = [];

	type Authorization = {
		personalServiceTypeId: number;
		price: number;
	};

	// Traductions
	const page_title = t('app.providers.service.tab_title');
	const new_announcement = t('landing.global.forms.new_announcement');
	const new_service_announcement = t('landing.global.forms.new_service_announcement');
	const cancel = t('landing.global.common.cancel');
	const publish = t('landing.global.common.publish');
	const delete_btn = t('landing.global.common.delete');
	const confirm_delete = t('landing.global.modals.confirm_delete');
	const confirm_delete_announcement = t('landing.global.modals.confirm_delete_announcement');
	const unauthorized_service = t('landing.global.notifications.unauthorized_service');
	const all_fields_required = t('landing.global.notifications.all_fields_required');
	const announcement_created = t('landing.global.notifications.announcement_created');
	const announcement_creation_error = t('landing.global.notifications.announcement_creation_error');
	const announcement_deleted = t('landing.global.notifications.announcement_deleted');
	const announcement_cancelled = t('landing.global.notifications.announcement_cancelled');

	onMount(async () => {
		await loadServiceTypes();
		await loadAds();
		onDestroy(tabTitle('app.providers.service.tab_title'));
	});

	async function loadAds() {
		const fetchedAds = await fetchFromAPI<PersonalServiceAd[]>('/personal-service-ads', {
			headers: { Authorization: `Bearer ${get(accessToken)}` }
		});

		console.log(fetchedAds);

		ads = await Promise.all(
			fetchedAds.map(async (ad: any) => {
				const typeId = ad.typeId ?? -1;
				const serviceType = serviceTypes.find((st) => st.id === typeId);

				// Injecter un objet type cohérent
				ad.type = {
					id: typeId,
					name: serviceType ? serviceType.name : 'Type inconnu'
				};

				return ad;
			})
		);

		console.log(ads);
	}

	async function loadServiceTypes() {
		try {
			const all = await fetchFromAPI<ServiceType[]>('/personal-service-types', {
				headers: getHeaders()
			});
			serviceTypes = all;

			const auths = await fetchFromAPI<Authorization[]>(
				`/personal-service-type-authorizations?providerId=${get(profileIds).providerId}`,
				{ headers: getHeaders() }
			);
			authorizedTypeIds = auths.map((a) => a.personalServiceTypeId);
			
			// Créer une liste des services autorisés avec leurs prix
			authorizedServicesWithPrices = auths.map(auth => {
				const serviceType = serviceTypes.find(st => st.id === auth.personalServiceTypeId);
				return {
					id: auth.personalServiceTypeId,
					name: serviceType?.name || 'Service inconnu',
					price: auth.price
				};
			});
		} catch {
			notifications.error('Erreur lors du chargement des types de prestations');
		}
	}

	function handleFilesSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			files = Array.from(input.files);
			imageUrls = files.map((f) => URL.createObjectURL(f));
		}
	}

	async function handleSubmit() {
		if (!title || !description || selectedTypeId < 0 || files.length === 0) {
			return notifications.warning($all_fields_required);
		}
		if (!authorizedTypeIds.includes(selectedTypeId)) {
			return notifications.error($unauthorized_service);
		}

		isSubmitting = true;
		try {
			const form = new FormData();
			form.append('title', title);
			form.append('description', description);
			form.append('typeId', String(selectedTypeId));
			files.forEach((f) => form.append('images', f));

			await fetchFromAPI('/personal-service-ads', {
				method: 'POST',
				headers: { Authorization: `Bearer ${get(accessToken)}` },
				body: form
			});

			notifications.success($announcement_created);
			title = '';
			description = '';
			selectedTypeId = -1;
			files = [];
			imageUrls = [];
			showModal = false;
		} catch {
			notifications.error($announcement_creation_error);
		} finally {
			isSubmitting = false;
		}
	}

	function getHeaders() {
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${get(accessToken)}`
		};
	}

	let deleteId: number | null = null;

	function openDeleteModal(id: number) {
		deleteId = id;
		showDeleteModal = true;
	}

	function cancelDelete() {
		showDeleteModal = false;
		deleteId = null;
	}

	async function confirmDelete() {
		if (deleteId === null) return;
		try {
			const res = await fetchFromAPI<{ action: 'deleted' | 'cancelled' }>(`/personal-service-ads/${deleteId}`, {
				method: 'DELETE',
				headers: getHeaders()
			});
			
			if (res.action === 'deleted') {
				notifications.success($announcement_deleted);
			} else {
				notifications.success($announcement_cancelled);
			}
			
			await loadAds();
		} catch {
			notifications.error('Erreur lors de la suppression');
		} finally {
			showDeleteModal = false;
			deleteId = null;
		}
	}
</script>

<div class="bg-base-200 mx-auto p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="font-author text-2xl text-gray-800">Mes prestations</h1>
		<button on:click={() => (showModal = true)} class="btn btn-primary">{$new_announcement}</button>
	</div>

	{#if showModal}
		<div class="modal modal-open">
			<div class="modal-box max-w-xl">
				<h3 class="mb-4 text-lg font-bold">{$new_service_announcement}</h3>

				<div class="form-control mb-4">
					<label class="label" for="title-input">Titre</label>
					<input id="title-input" class="input input-bordered w-full" bind:value={title} />
				</div>

				<div class="form-control mb-4">
					<label class="label" for="description-input">Description</label>
					<textarea
						id="description-input"
						class="textarea textarea-bordered w-full"
						bind:value={description}
					></textarea>
				</div>

				<div class="form-control mb-4">
					<label class="label" for="service-type-select">Type de prestation</label>
					<select
						id="service-type-select"
						bind:value={selectedTypeId}
						class="select select-bordered w-full"
					>
						<option value={-1} disabled>Sélectionner</option>
						{#each serviceTypes as st}
							{@const isAuthorized = authorizedTypeIds.includes(st.id)}
							{@const authorizedService = authorizedServicesWithPrices.find(s => s.id === st.id)}
							<option value={st.id} disabled={!isAuthorized}>
								{st.name}
								{#if isAuthorized && authorizedService}
									({authorizedService.price}€)
								{:else if !isAuthorized}
									(non autorisé)
								{/if}
							</option>
						{/each}
					</select>
				</div>

				<div class="form-control mb-4">
					<label class="label" for="images-input">Images</label>
					<input
						id="images-input"
						type="file"
						accept="image/*"
						multiple
						class="file-input file-input-bordered w-full"
						on:change={handleFilesSelected}
					/>
				</div>

				{#if imageUrls.length}
					<div class="mb-4 grid grid-cols-2 gap-2">
						{#each imageUrls as url}
							<img src={url} alt="Preview" class="h-24 w-full rounded border object-cover" />
						{/each}
					</div>
				{/if}

				<div class="modal-action">
					<button class="btn" on:click={() => (showModal = false)}>{$cancel}</button>
					<button class="btn btn-primary" on:click={handleSubmit} disabled={isSubmitting}
						>{$publish}</button
					>
				</div>
			</div>
		</div>
	{/if}

	<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each ads as ad}
			<div class="card bg-white shadow-md">
				{#if ad.imageUrls?.length > 0}
					<div class="carousel h-40 w-full rounded-t-lg sm:h-48">
						{#each ad.imageUrls as url, i}
							<div id="item-{ad.id}-{i}" class="carousel-item relative w-full">
								<img
									src={url}
									alt="Image {i + 1}"
									class="h-full w-full rounded-t-lg object-cover"
									loading="lazy"
								/>
								<div
									class="bg-opacity-50 absolute right-2 bottom-2 rounded bg-black px-2 py-1 text-xs text-white"
								>
									{i + 1}/{ad.imageUrls.length}
								</div>
							</div>
						{/each}
					</div>

					<!-- Navigation -->
					<div class="mt-2 flex justify-center gap-2">
						{#each ad.imageUrls as _, i}
							<button
								class="btn btn-xs"
								on:click={() => {
									const el = document.getElementById(`item-${ad.id}-${i}`);
									el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
								}}
							>
								{i + 1}
							</button>
						{/each}
					</div>
				{:else}
					<figure class="flex h-40 items-center justify-center rounded-t-lg bg-gray-200 sm:h-48">
						<span class="text-gray-500">Aucune photo disponible</span>
					</figure>
				{/if}
				<div class="card-body p-4">
					<h2 class="card-title text-lg">{ad.title}</h2>
					<p class="text-sm text-gray-700">{ad.description}</p>
					<p class="mt-2 text-xs text-gray-500">
						{ad.type.name} – Créé le {new Date(ad.createdAt).toLocaleDateString()}
					</p>
					<button
						on:click={() => openDeleteModal(ad.id)}
						class="btn btn-xs btn-error top-2 right-2"
					>
						{$delete_btn}
					</button>
				</div>
			</div>
		{/each}
	</div>

	{#if showDeleteModal}
		<div class="modal modal-open">
			<div class="modal-box">
				<h3 class="text-lg font-bold">{$confirm_delete}</h3>
				<p>{$confirm_delete_announcement}</p>
				<div class="modal-action">
					<button class="btn" on:click={cancelDelete}>{$cancel}</button>
					<button class="btn btn-error" on:click={confirmDelete}>{$delete_btn}</button>
				</div>
			</div>
		</div>
	{/if}
</div>
