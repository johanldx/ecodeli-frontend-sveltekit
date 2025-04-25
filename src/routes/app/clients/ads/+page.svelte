<script lang="ts">
	import { notifications } from '$lib/stores/notifications';
	import { accessToken } from '$lib/stores/token';
	import { user } from '$lib/stores/user';
	import { fetchFromAPI } from '$lib/utils/api';
	import { t } from '$lib/utils/t';
	import { get } from 'svelte/store';
	import { onDestroy, onMount } from 'svelte';
	import { tabTitle } from '$lib/utils/tabTitle';

onMount(() => onDestroy(tabTitle('app.clients.ads')));

  function waitUntil(conditionFn: () => boolean, interval = 50): Promise<void> {
		return new Promise((resolve) => {
			const check = () => {
				if (conditionFn()) resolve();
				else setTimeout(check, interval);
			};
			check();
		});
	}

	const title = t('app.clients.ads.title');

	let showModal = false;
	let selectedType = '';

	interface Location {
		id: number;
		name: string;
		address: string;
		cp: string;
		city: string;
		country: string;
	}

	interface ShoppingAd {
		id: number;
		title: string;
		description: string;
		price: number;
		imageUrls: string[];
	}

	let shoppingAds: ShoppingAd[] = [];
	let locations: Location[] = [];

	// formulaire
	let form_title = '';
	let form_description = '';
	let form_price = 0;
	let form_files: File[] = [];
	let form_imageUrls: string[] = [];
	let form_departureLocationId: number = -1;
	let form_arrivalLocationId: number = -1;
	let form_shoppingListArray: string[] = [];
	let form_shoppingItem = '';

	onMount(async () => {
		await loadAds();
		await loadLocations();
	});

	async function loadAds() {
		try {
			shoppingAds = await fetchFromAPI<ShoppingAd[]>('/shopping-ads', {
				headers: getAuthHeaders()
			});
		} catch {
			notifications.error('Erreur lors du chargement des annonces');
		}
	}

	async function loadLocations() {
		try {
			locations = await fetchFromAPI<Location[]>('/locations', {
				headers: getAuthHeaders()
			});
		} catch {
			notifications.error('Erreur lors du chargement des adresses');
		}
	}

	function getAuthHeaders() {
		return {
			Authorization: `Bearer ${get(accessToken)}`
		};
	}

	function openAddModal() {
		showModal = true;
	}

	function handleFilesSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			form_files = Array.from(input.files);
			form_imageUrls = form_files.map(file => URL.createObjectURL(file));
		}
	}

	function addShoppingItem() {
		const trimmed = form_shoppingItem.trim();
		if (trimmed.length > 0) {
			form_shoppingListArray = [...form_shoppingListArray, trimmed];
			form_shoppingItem = '';
		}
	}

	function removeShoppingItem(index: number) {
		form_shoppingListArray = form_shoppingListArray.filter((_, i) => i !== index);
	}

	async function handleCreate() {
		try {
			await waitUntil(() => !!get(accessToken));

			const token = get(accessToken)!;

			const form = new FormData();
      const currentUser = get(user)!;
      form.append('posted_by', String(currentUser.id));
			form.append('title', form_title);
			form.append('description', form_description);
			form.append('status', 'pending');
			form.append('departureLocationId', String(form_departureLocationId));
			form.append('arrivalLocationId', String(form_arrivalLocationId));
			form.append('packageSize', 'XS');
			form.append('price', String(form_price));

			for (const item of form_shoppingListArray) {
				form.append('shoppingList', item);
			}

			for (const file of form_files) {
				form.append('images', file);
			}

			await fetchFromAPI('/shopping-ads', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: form
			});

			notifications.success('Annonce créée avec succès');
			showModal = false;
			await loadAds();
		} catch (err) {
			console.error(err);
			notifications.error('Erreur lors de la création');
		}
	}
</script>

<div class="p-4 md:p-6 bg-base-200 min-h-screen">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-author text-gray-800">{$title}</h1>
		<button on:click={openAddModal} class="btn btn-primary">Nouvelle demande</button>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
		{#each shoppingAds as ad}
			<div class="card bg-base-100 shadow-sm w-full mx-auto">
        {#if ad.imageUrls?.length > 0}
        <div class="carousel w-full h-40 sm:h-48 rounded-t-lg">
          {#each ad.imageUrls as url, i}
            <div id="item-{ad.id}-{i}" class="carousel-item relative w-full">
                <img src={url} alt="Image {i + 1}" class="w-full h-full object-cover rounded-t-lg" loading="lazy" />
              <div class="absolute bottom-2 right-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                {i + 1}/{ad.imageUrls.length}
              </div>
            </div>
          {/each}
        </div>
      
        <!-- Navigation -->
        <div class="flex justify-center gap-2 mt-2">
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
        <figure class="bg-gray-200 h-40 sm:h-48 flex items-center justify-center rounded-t-lg">
          <span class="text-gray-500">Aucune photo disponible</span>
        </figure>
      {/if}
				<div class="card-body p-4 md:p-6">
					<div>
						<p class="badge badge-neutral badge-outline py-2 px-3 mt-2 mr-2">Liste de courses</p>
						<p class="badge badge-neutral py-2 px-3 mt-2">{ad.price} €</p>
					</div>
					<h2 class="card-title text-sm sm:text-base">{ad.title}</h2>
					<p class="text-xs sm:text-sm text-gray-600">{ad.description}</p>
				</div>
			</div>
		{/each}
	</div>

	{#if showModal}
		<div class="modal modal-open">
			<div class="modal-box max-w-xl">
				<h3 class="font-bold text-lg mb-4">Nouvelle annonce</h3>

				<div class="form-control mb-4">
					<label class="label"><span class="label-text">Type d'annonce</span></label>
					<select bind:value={selectedType} class="select select-bordered w-full">
						<option value="" disabled selected>Sélectionner un type</option>
						<option value="shopping-ads">Liste de courses</option>
						<option value="delivery-request">Demande de livraison</option>
						<option value="custom-service">Service personnalisé</option>
					</select>
				</div>

				{#if selectedType === 'shopping-ads'}
					<div class="space-y-4">
						<div class="form-control">
							<label class="label"><span class="label-text">Titre</span></label>
							<input type="text" class="input input-bordered w-full" bind:value={form_title} />
						</div>

						<div class="form-control">
							<label class="label"><span class="label-text">Description</span></label>
							<textarea class="textarea textarea-bordered w-full" bind:value={form_description}></textarea>
						</div>

						<div class="form-control">
							<label class="label"><span class="label-text">Images</span></label>
							<input type="file" accept="image/*" multiple class="file-input file-input-bordered w-full" on:change={handleFilesSelected} />
						</div>

						{#if form_imageUrls.length}
							<div class="grid grid-cols-2 gap-2">
								{#each form_imageUrls as url}
									<img src={url} alt="Preview" class="rounded border h-24 object-cover" />
								{/each}
							</div>
						{/if}

						<div class="form-control">
							<label class="label"><span class="label-text">Ajouter un élément</span></label>
							<div class="flex gap-2">
								<input type="text" class="input input-bordered w-full" bind:value={form_shoppingItem} />
								<button class="btn btn-outline" type="button" on:click={addShoppingItem}>Ajouter</button>
							</div>
						</div>

						{#if form_shoppingListArray.length}
							<ul class="list-disc list-inside space-y-1 mt-2">
								{#each form_shoppingListArray as item, i}
									<li class="flex justify-between items-center">
										<span>{item}</span>
										<button class="btn btn-xs btn-error" type="button" on:click={() => removeShoppingItem(i)}>X</button>
									</li>
								{/each}
							</ul>
						{/if}

						<div class="form-control">
							<label class="label"><span class="label-text">Prix (€)</span></label>
							<input type="number" class="input input-bordered w-full" bind:value={form_price} />
						</div>

						<div class="flex gap-4">
							<div class="form-control w-full">
								<label class="label"><span class="label-text">Lieu de départ</span></label>
								<select bind:value={form_departureLocationId} class="select select-bordered w-full">
									<option value={-1} disabled selected>Choisir</option>
									{#each locations as loc}
										<option value={loc.id}>{loc.name} ({loc.cp})</option>
									{/each}
								</select>
							</div>

							<div class="form-control w-full">
								<label class="label"><span class="label-text">Lieu d’arrivée</span></label>
								<select bind:value={form_arrivalLocationId} class="select select-bordered w-full">
									<option value={-1} disabled selected>Choisir</option>
									{#each locations as loc}
										<option value={loc.id}>{loc.name} ({loc.cp})</option>
									{/each}
								</select>
							</div>
						</div>
					</div>
				{:else if selectedType === 'delivery-request'}
					<p class="text-sm text-gray-500 mt-4">Formulaire de livraison à venir...</p>
				{:else if selectedType === 'custom-service'}
					<p class="text-sm text-gray-500 mt-4">Formulaire service personnalisé à venir...</p>
				{/if}

				<div class="modal-action mt-6">
					<button class="btn" on:click={() => showModal = false}>Annuler</button>
					{#if selectedType === 'shopping-ads'}
						<button class="btn btn-primary" on:click={handleCreate}>Créer</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
