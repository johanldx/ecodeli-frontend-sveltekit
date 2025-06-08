<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
	import { profileIds } from '$lib/stores/profiles';
	import { fetchFromAPI } from '$lib/utils/api';
	import { notifications } from '$lib/stores/notifications';

	type ServiceType = {
		id: number;
		name: string;
	};

	let serviceTypes: ServiceType[] = [];
	let authorizedTypeIds: number[] = [];

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

	onMount(async () => {
		await loadServiceTypes();
		await loadAds();
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

			const auths = await fetchFromAPI<{ personalServiceTypeId: number }[]>(
				`/personal-service-type-authorizations?providerId=${get(profileIds).providerId}`,
				{ headers: getHeaders() }
			);
			authorizedTypeIds = auths.map((a) => a.personalServiceTypeId);
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
			return notifications.warning('Tous les champs sont obligatoires.');
		}
		if (!authorizedTypeIds.includes(selectedTypeId)) {
			return notifications.error('Vous n’êtes pas autorisé à publier pour cette prestation.');
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

			notifications.success('Annonce créée avec succès');
			title = '';
			description = '';
			selectedTypeId = -1;
			files = [];
			imageUrls = [];
			showModal = false;
		} catch {
			notifications.error("Erreur lors de la création de l'annonce.");
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
			const res = await fetchFromAPI(`/personal-service-ads/${deleteId}`, {
				method: 'DELETE',
				headers: getHeaders()
			});
			if (res == null) {
				notifications.success('Annonce supprimée');
				await loadAds();
			}
		} catch {
			notifications.error('Erreur lors de la suppression');
		} finally {
			showDeleteModal = false;
			deleteId = null;
		}
	}
</script>

<div class="bg-base-200 mx-auto min-h-screen p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="font-author text-2xl text-gray-800">Mes prestations</h1>
		<button on:click={() => (showModal = true)} class="btn btn-primary">Nouvelle annonce</button>
	</div>

	{#if showModal}
		<div class="modal modal-open">
			<div class="modal-box max-w-xl">
				<h3 class="mb-4 text-lg font-bold">Nouvelle annonce de prestation</h3>

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
							<option value={st.id} disabled={!authorizedTypeIds.includes(st.id)}>
								{st.name}
								{#if !authorizedTypeIds.includes(st.id)}(non autorisé){/if}
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
					<button class="btn" on:click={() => (showModal = false)}>Annuler</button>
					<button class="btn btn-primary" on:click={handleSubmit} disabled={isSubmitting}
						>Publier</button
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
						Supprimer
					</button>
				</div>
			</div>
		{/each}
	</div>

	{#if showDeleteModal}
		<div class="modal modal-open">
			<div class="modal-box">
				<h3 class="text-lg font-bold">Confirmer la suppression</h3>
				<p>Voulez-vous vraiment supprimer cette annonce ?</p>
				<div class="modal-action">
					<button class="btn" on:click={cancelDelete}>Annuler</button>
					<button class="btn btn-error" on:click={confirmDelete}>Supprimer</button>
				</div>
			</div>
		</div>
	{/if}
</div>
