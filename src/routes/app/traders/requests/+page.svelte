<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { v4 as uuidv4 } from 'uuid';

	import { accessToken } from '$lib/stores/token';
	import { user } from '$lib/stores/user';
	import { notifications } from '$lib/stores/notifications';
	import { fetchFromAPI } from '$lib/utils/api';

	interface Location {
		id: number;
		name: string;
		cp: string;
	}

	interface TraderAd {
		id: number;
		title: string;
		description: string;
		imageUrls: string[];
		status: string;
		reference: string;
		departureLocation: Address;
		arrivalLocation: Address;
		postedBy: number;
		clientEmail: string;
		packageSize: string;
		price: number;
	}

	type Address = {
		id: number;
		userId: number;
		name: string;
		address: string;
		cp: string;
		city: string;
		country: string;
	};

	let ads: TraderAd[] = [];
	let locations: Location[] = [];
	let showModal = false;
	let showDeleteModal = false;
	let deleteId: number | null = null;

	let form = {
		title: '',
		description: '',
		clientEmail: '',
		departureLocationId: -1,
		arrivalLocationId: -1,
		packageSize: 'XS',
		price: 0,
		files: [] as File[],
		imageUrls: [] as string[]
	};

	onMount(async () => {
		await loadAds();
		await loadLocations();
	});

	async function loadAds() {
		ads = await fetchFromAPI<TraderAd[]>('/release-cart-ads', {
			headers: getAuthHeaders()
		});
	}

	async function loadLocations() {
		locations = await fetchFromAPI<Location[]>('/locations', {
			headers: getAuthHeaders()
		});
	}

	function getAuthHeaders() {
		return {
			Authorization: `Bearer ${get(accessToken)}`
		};
	}

	function handleFiles(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			form.files = Array.from(input.files);
			form.imageUrls = form.files.map((f) => URL.createObjectURL(f));
		}
	}

	function openAddModal() {
		showModal = true;
		form = {
			title: '',
			description: '',
			clientEmail: '',
			departureLocationId: -1,
			arrivalLocationId: -1,
			packageSize: 'XS',
			price: 0,
			files: [],
			imageUrls: []
		};
	}

	async function handleCreate() {
		if (
			!form.title ||
			!form.clientEmail ||
			form.departureLocationId === -1 ||
			form.arrivalLocationId === -1
		) {
			return notifications.error('Tous les champs obligatoires doivent être remplis');
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(form.clientEmail)) {
			return notifications.error('Email invalide');
		}

		const token = get(accessToken);
		const currentUser = get(user);
		const reference = uuidv4();

		if (!currentUser || !currentUser.id) {
			return notifications.error('Utilisateur non authentifié');
		}

		const formData = new FormData();
		formData.append('title', form.title);
		formData.append('description', form.description);
		formData.append('clientEmail', form.clientEmail);
		formData.append('departureLocation', form.departureLocationId.toString());
		formData.append('arrivalLocation', form.arrivalLocationId.toString());
		formData.append('posted_by', currentUser.id.toString());
		formData.append('reference', reference);
		formData.append('status', 'pending');
		formData.append('packageSize', form.packageSize);
		formData.append('price', form.price.toString());
		form.files.forEach((file) => formData.append('images', file));

		console.log(formData);

		await fetchFromAPI('/release-cart-ads', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: formData
		});

		showModal = false;
		await loadAds();
		notifications.success('Annonce trader créée');
	}

	function openDeleteModal(id: number) {
		deleteId = id;
		showDeleteModal = true;
	}

	async function confirmDelete() {
		if (deleteId === null) return;
		await fetchFromAPI(`/release-cart-ads/${deleteId}`, {
			method: 'DELETE',
			headers: getAuthHeaders()
		});
		deleteId = null;
		showDeleteModal = false;
		await loadAds();
		notifications.success('Annonce supprimée');
	}
</script>

<div class="bg-base-200 min-h-screen p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="font-author text-2xl text-gray-800">Annonces Traders</h1>
		<button class="btn btn-primary" on:click={openAddModal}>Nouvelle annonce</button>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each ads as ad}
			<div class="card bg-base-100 shadow">
				{#if ad.imageUrls?.length > 0}
					<div class="carousel h-40 w-full rounded-t-lg sm:h-48">
						{#each ad.imageUrls as url, i}
							<div id="ditem-{ad.id}-{i}" class="carousel-item relative w-full">
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
					<div class="mt-2 flex justify-center gap-2">
						{#each ad.imageUrls as _, i}
							<button
								class="btn btn-xs"
								on:click={() => {
									document
										.getElementById(`ditem-${ad.id}-${i}`)
										?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
								}}
							>
								{i + 1}
							</button>
						{/each}
					</div>
				{:else}
					<figure class="flex h-40 items-center justify-center rounded-t-lg bg-gray-200 sm:h-48">
						<span class="text-gray-500">Aucune photo</span>
					</figure>
				{/if}
				<div class="card-body">
					<div>
						<p class="badge badge-neutral badge-outline mt-2 mr-2 px-3 py-2">Lacher de chariot</p>
						<p class="badge badge-neutral mt-2 px-3 py-2">{ad.price} €</p>
					</div>
					<h2 class="card-title">{ad.title}</h2>
					<p class="text-sm text-gray-500">{ad.description}</p>
					<p class="text-sm">Client : {ad.clientEmail}</p>
					<p class="text-xs">
						Départ : {ad.departureLocation.name} → Arrivée : {ad.arrivalLocation.name}
					</p>
					<div class="mt-2 flex justify-end">
						<button class="btn btn-xs btn-error" on:click={() => openDeleteModal(ad.id)}
							>Supprimer</button
						>
					</div>
				</div>
			</div>
		{/each}
	</div>

	{#if showModal}
		<div class="modal modal-open">
			<div class="modal-box max-w-xl">
				<h3 class="mb-4 text-lg">Nouvelle annonce</h3>
				<div class="form-control mb-3">
					<label class="label" for="title-input"><span class="label-text">Titre</span></label>
					<input id="title-input" class="input input-bordered w-full" bind:value={form.title} />
				</div>
				<div class="form-control mb-3">
					<label class="label" for="description-input"
						><span class="label-text">Description</span></label
					>
					<textarea
						id="description-input"
						class="textarea textarea-bordered w-full"
						bind:value={form.description}
					></textarea>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="package-size-select"
						><span class="label-text">Taille du colis</span></label
					>
					<select
						id="package-size-select"
						class="select select-bordered w-full"
						bind:value={form.packageSize}
					>
						<option value="XS">XS</option>
						<option value="S">S</option>
						<option value="M">M</option>
						<option value="XL">XL</option>
						<option value="XXL">XXL</option>
					</select>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="price-input"><span class="label-text">Prix (€)</span></label>
					<input
						id="price-input"
						type="number"
						class="input input-bordered w-full"
						bind:value={form.price}
					/>
					<p class="mt-1 text-xs text-gray-500">Conseil : 1€ du km</p>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="client-email-input"
						><span class="label-text">Email client</span></label
					>
					<input
						id="client-email-input"
						class="input input-bordered w-full"
						bind:value={form.clientEmail}
					/>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="departure-location-select"
						><span class="label-text">Lieu de départ</span></label
					>
					<select
						id="departure-location-select"
						class="select select-bordered w-full"
						bind:value={form.departureLocationId}
					>
						<option value={-1} disabled selected>Choisir</option>
						{#each locations as loc}
							<option value={loc.id}>{loc.name} ({loc.cp})</option>
						{/each}
					</select>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="arrival-location-select"
						><span class="label-text">Lieu d’arrivée</span></label
					>
					<select
						id="arrival-location-select"
						class="select select-bordered w-full"
						bind:value={form.arrivalLocationId}
					>
						<option value={-1} disabled selected>Choisir</option>
						{#each locations as loc}
							<option value={loc.id}>{loc.name} ({loc.cp})</option>
						{/each}
					</select>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="images-input"><span class="label-text">Images</span></label>
					<input
						id="images-input"
						type="file"
						multiple
						accept="image/*"
						class="file-input file-input-bordered w-full"
						on:change={handleFiles}
					/>
				</div>
				{#if form.imageUrls.length}
					<div class="mb-3 grid grid-cols-3 gap-2">
						{#each form.imageUrls as url}
							<img src={url} alt="Sélectionnée" class="h-20 w-full rounded border object-cover" />
						{/each}
					</div>
				{/if}
				<div class="modal-action">
					<button class="btn" on:click={() => (showModal = false)}>Annuler</button>
					<button class="btn btn-primary" on:click={handleCreate}>Créer</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showDeleteModal}
		<div class="modal modal-open">
			<div class="modal-box">
				<h3 class="text-lg font-bold">Supprimer l’annonce ?</h3>
				<div class="modal-action">
					<button class="btn" on:click={() => (showDeleteModal = false)}>Annuler</button>
					<button class="btn btn-error" on:click={confirmDelete}>Supprimer</button>
				</div>
			</div>
		</div>
	{/if}
</div>
