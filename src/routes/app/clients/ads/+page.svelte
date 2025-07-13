<script lang="ts">
	import { notifications } from '$lib/stores/notifications';
import { accessToken } from '$lib/stores/token';
import { user } from '$lib/stores/user';
import { fetchFromAPI } from '$lib/utils/api';
import { t } from '$lib/utils/t';
import { get } from 'svelte/store';
import { onDestroy, onMount } from 'svelte';
import { tabTitle } from '$lib/utils/tabTitle';
import { validateFilesSize } from '$lib/utils/fileValidation';
import { validatePrice } from '$lib/utils/priceValidation';

	onMount(() => onDestroy(tabTitle('app.clients.ads.tab_title')));

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

	let showDetailsModal = false;
	let selectedAd: any = null;
	let selectedAdType: 'shopping' | 'delivery' | null = null;
	let deliveryStepsDetails: any[] = [];
	let deliveryStepsLoading = false;
	let locationsCache: Record<number, any> = {};

	interface Location {
		id: number;
		name: string;
		address: string;
		cp: string;
		city: string;
		country: string;
		public?: boolean;
	}

	interface ShoppingAd {
		id: number;
		title: string;
		description: string;
		price: number;
		imageUrls: string[];
		status: string;
	}

	interface DeliveryAd {
		id: number;
		title: string;
		description: string;
		imageUrls: string[];
		deliveryDate: string;
		packageSize: string;
		status: string;
		deliverySteps?: {
			stepNumber: number;
			price: number;
			status: string;
			departureLocation: { id: number; name: string };
			arrivalLocation: { id: number; name: string };
		}[];
	}

	interface DeliveryStepInput {
		stepNumber: number;
		price: number;
		departureLocationId: number;
		arrivalLocationId: number;
		status: string;
	}

	let shoppingAds: ShoppingAd[] = [];
	let locations: Location[] = [];
	let allLocations: Location[] = []; // Pour les étapes de livraison (inclut les adresses publiques)
	let deliveryAds: DeliveryAd[] = [];
	let form_delivery = {
		title: '',
		description: '',
		deliveryDate: '',
		packageSize: 'XS',
		files: [] as File[],
		imageUrls: [] as string[],
		steps: [] as DeliveryStepInput[],
		newStep: {
			price: 1,
			departureLocationId: -1,
			arrivalLocationId: -1,
			status: 'pending'
		} as Omit<DeliveryStepInput, 'stepNumber'>
	};

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
		await loadAllLocations();
	});

	async function loadAds() {
		try {
			// shoppingAds inchangé
			shoppingAds = await fetchFromAPI<ShoppingAd[]>('/shopping-ads/mine', {
				headers: getAuthHeaders()
			});

			// on récupère "cru" et on mappe en normalisé
			const raw = await fetchFromAPI<any[]>('/delivery-ads/mine', {
				headers: getAuthHeaders()
			});

			deliveryAds = raw.map((ad) => ({
				id: ad.id,
				title: ad.title,
				description: ad.description,
				// gère imageUrls retourné sous l'un ou l'autre format
				imageUrls: ad.imageUrls ?? ad.image_urls ?? [],
				// date et packageSize
				deliveryDate: ad.deliveryDate ?? ad.delivery_date,
				packageSize: ad.packageSize ?? ad.package_size,
				status: ad.status ?? 'pending',
				// mappe les étapes, qu'elles s'appellent deliverySteps ou delivery_steps
				deliverySteps: (ad.deliverySteps ?? ad.delivery_steps ?? []).map((s: any) => ({
					stepNumber: s.stepNumber ?? s.step_number,
					price: s.price,
					status: s.status ?? 'pending',
					departureLocation: {
						id: s.departureLocation?.id ?? s.departure_location.id,
						name: s.departureLocation?.name ?? s.departure_location.name
					},
					arrivalLocation: {
						id: s.arrivalLocation?.id ?? s.arrival_location.id,
						name: s.arrivalLocation?.name ?? s.arrival_location.name
					}
				}))
			}));
		} catch {
			notifications.error('Erreur lors du chargement des annonces');
		}
	}

	async function loadLocations() {
		try {
			const allLocations = await fetchFromAPI<Location[]>('/locations', {
				headers: getAuthHeaders()
			});
			// Filtrer les adresses publiques (public=true) seulement pour les annonces de courses
			// Pour les étapes de livraison, on garde toutes les adresses
			locations = allLocations.filter(location => !location.public);
		} catch {
			notifications.error('Erreur lors du chargement des adresses');
		}
	}

	// Fonction pour charger toutes les adresses (y compris publiques) pour les étapes de livraison
	async function loadAllLocations() {
		try {
			allLocations = await fetchFromAPI<Location[]>('/locations', {
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

	function getStatusLabel(status: string): string {
		const statusMap: Record<string, string> = {
			'pending': 'En attente',
			'in_progress': 'En cours',
			'completed': 'Terminée',
			'cancelled': 'Annulée',
			'Pending': 'En attente',
			'Ongoing': 'En cours',
			'Completed': 'Terminée',
			'PENDING': 'En attente de paiement',
			'COMPLETED': 'Payé',
			'FAILED': 'Échec'
		};
		return statusMap[status] || status;
	}

	function getStatusColor(status: string): string {
		const colorMap: Record<string, string> = {
			'pending': 'badge-warning',
			'in_progress': 'badge-info',
			'completed': 'badge-success',
			'cancelled': 'badge-error',
			'Pending': 'badge-warning',
			'Ongoing': 'badge-info',
			'Completed': 'badge-success',
			'PENDING': 'badge-warning',
			'COMPLETED': 'badge-success',
			'FAILED': 'badge-error'
		};
		return colorMap[status] || 'badge-neutral';
	}

	function openAddModal() {
		showModal = true;
		selectedType = '';
		// reset shopping...
		// reset delivery 👇
		form_delivery = {
			title: '',
			description: '',
			deliveryDate: '',
			packageSize: 'XS',
			files: [],
			imageUrls: [],
			steps: [],
			newStep: { price: 1, departureLocationId: -1, arrivalLocationId: -1, status: 'pending' }
		};
	}

	function handleFilesSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			const selectedFiles = Array.from(input.files);
			if (validateFilesSize(selectedFiles)) {
				form_files = selectedFiles;
				form_imageUrls = form_files.map((file) => URL.createObjectURL(file));
			} else {
				input.value = '';
			}
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

			if (selectedType === 'shopping-ads') {
				if (!form_title.trim() || !form_description.trim() || form_departureLocationId === -1 || form_arrivalLocationId === -1) {
					return notifications.error('Merci de remplir tous les champs obligatoires pour la course.');
				}
				if (!validatePrice(form_price)) {
					return;
				}
				if (form_delivery.deliveryDate && new Date(form_delivery.deliveryDate) < new Date()) {
					return notifications.error('La date ne peut pas être dans le passé.');
				}
				// Création d'une annonce de course
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

				// Shopping list
				for (const item of form_shoppingListArray) {
					form.append('shoppingList', item);
				}
				// Images
				for (const file of form_files) {
					form.append('images', file);
				}

				await fetchFromAPI('/shopping-ads', {
					method: 'POST',
					headers: { Authorization: `Bearer ${token}` },
					body: form
				});
			} else if (selectedType === 'delivery-request') {
				if (!form_delivery.title.trim() || !form_delivery.description.trim() || !form_delivery.deliveryDate || form_delivery.steps.length === 0) {
					return notifications.error('Merci de remplir tous les champs obligatoires pour la livraison.');
				}
				if (new Date(form_delivery.deliveryDate) < new Date()) {
					return notifications.error('La date de livraison ne peut pas être dans le passé.');
				}
				await createDeliveryRequest(token);
			} else {
				throw new Error('Type de formulaire invalide');
			}

			notifications.success('Annonce créée avec succès');
			showModal = false;
			await loadAds();
		} catch (err) {
			console.error(err);
			notifications.error('Erreur lors de la création');
		}
	}

	async function createDeliveryRequest(token: string) {
		// 1) Création de l'annonce
		const formAd = new FormData();
		formAd.append('title', form_delivery.title);
		formAd.append('description', form_delivery.description);
		formAd.append('delivery_date', new Date(form_delivery.deliveryDate).toISOString());
		formAd.append('package_size', form_delivery.packageSize);
		form_delivery.files.forEach((f) => formAd.append('images', f));

		const ad = await fetchFromAPI<{ id: number }>('/delivery-ads', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: formAd
		});

		// 2) Création des étapes — corps JSON strictement conforme au DTO
		for (const s of form_delivery.steps) {
			const body = {
				deliveryAdId: ad.id,
				stepNumber: s.stepNumber,
				price: s.price,
				departureLocationId: s.departureLocationId,
				arrivalLocationId: s.arrivalLocationId,
				status: s.status
			};

			console.log(body);
			await fetchFromAPI('/delivery-steps', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});
		}
	}
	function handleFiles(event: Event, target: 'delivery') {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			const selectedFiles = Array.from(input.files);
			if (validateFilesSize(selectedFiles)) {
				form_delivery.files = selectedFiles;
				form_delivery.imageUrls = form_delivery.files.map((f) => URL.createObjectURL(f));
			} else {
				input.value = '';
			}
		}
	}

	function addDeliveryStep() {
		const { price, departureLocationId, arrivalLocationId, status } = form_delivery.newStep;

		if (!validatePrice(price)) {
			return;
		}
		// Si on a déjà au moins une étape, la nouvelle doit démarrer là où la précédente s'est arrêtée
		if (form_delivery.steps.length > 0) {
			const last = form_delivery.steps[form_delivery.steps.length - 1];
			if (departureLocationId !== last.arrivalLocationId) {
				return notifications.error(
					`Le départ de l'étape ${form_delivery.steps.length + 1} doit être ` +
					`l'arrivée de l'étape ${last.stepNumber} (${allLocations.find((l) => l.id === last.arrivalLocationId)?.name})`
				);
			}
		}

		if (price >= 1 && departureLocationId > 0 && arrivalLocationId > 0) {
			const stepNumber = form_delivery.steps.length + 1;
			form_delivery.steps.push({
				stepNumber,
				price,
				departureLocationId,
				arrivalLocationId,
				status
			});
			form_delivery.newStep = {
				price: 1,
				departureLocationId: arrivalLocationId,
				arrivalLocationId: -1,
				status: 'pending'
			};
		} else {
			notifications.error('Merci de remplir tous les champs de l\'étape');
		}
	}

	function removeDeliveryStep(index: number) {
		form_delivery.steps.splice(index, 1);
		// Réindexer les numéros d'étape
		form_delivery.steps = form_delivery.steps.map((step, i) => ({
			...step,
			stepNumber: i + 1
		}));
	}

	// État pour la modale de suppression
	let showDeleteModal = false;
	let deleteType: 'shopping' | 'delivery' = 'shopping';
	let deleteId: number | null = null;

	// Ouvre la modale (à appeler depuis le bouton)
	function openDeleteModal(type: 'shopping' | 'delivery', id: number) {
		deleteType = type;
		deleteId = id;
		showDeleteModal = true;
	}

	// Annule la suppression
	function cancelDelete() {
		showDeleteModal = false;
		deleteId = null;
	}

	// Confirme et lance la suppression
	async function confirmDelete() {
		if (deleteId === null) return;
		try {
			const res = await fetchFromAPI(
				deleteType === 'shopping' ? `/shopping-ads/${deleteId}` : `/delivery-ads/${deleteId}`,
				{ method: 'DELETE', headers: getAuthHeaders() }
			);
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

	function openDetailsModal(ad: any, type: 'shopping' | 'delivery') {
		selectedAd = ad;
		selectedAdType = type;
		showDetailsModal = true;
		if (type === 'delivery') {
			loadDeliverySteps(ad.id);
		}
	}
	function closeDetailsModal() {
		showDetailsModal = false;
		selectedAd = null;
		selectedAdType = null;
		deliveryStepsDetails = [];
		deliveryStepsLoading = false;
	}

	async function loadDeliverySteps(deliveryAdId: number) {
		deliveryStepsLoading = true;
		try {
			const token = get(accessToken);
			const authHeaders = { Authorization: `Bearer ${token}` };
			const steps = await fetchFromAPI<any[]>(`/delivery-steps/delivery-ad/${deliveryAdId}`, { headers: authHeaders });
			for (const step of steps) {
				if (!locationsCache[step.departureLocationId]) {
					locationsCache[step.departureLocationId] = await fetchFromAPI(`/locations/${step.departureLocationId}`, { headers: authHeaders });
				}
				if (!locationsCache[step.arrivalLocationId]) {
					locationsCache[step.arrivalLocationId] = await fetchFromAPI(`/locations/${step.arrivalLocationId}`, { headers: authHeaders });
				}
				step.departureLocation = locationsCache[step.departureLocationId];
				step.arrivalLocation = locationsCache[step.arrivalLocationId];
			}
			deliveryStepsDetails = steps;
		} catch (e) {
			deliveryStepsDetails = [];
		} finally {
			deliveryStepsLoading = false;
		}
	}
</script>

<div class="bg-base-200 p-4 md:p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="font-author text-2xl text-gray-800">{$title}</h1>
		<button on:click={openAddModal} class="btn btn-primary">Nouvelle demande</button>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
		{#each shoppingAds as ad}
			<div class="card bg-base-100 mx-auto w-full shadow-sm">
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
				<div class="card-body p-4 md:p-6">
					<div>
						<p class="badge badge-neutral badge-outline mt-2 mr-2 px-3 py-2">Liste de courses</p>
						<p class="badge badge-neutral mt-2 px-3 py-2">{ad.price} €</p>
						{#if ad.status}
							<span class="badge {getStatusColor(ad.status)} mt-2">
								{getStatusLabel(ad.status)}
							</span>
						{/if}
					</div>
					<h2 class="card-title text-sm sm:text-base">{ad.title}</h2>
					<p class="text-xs text-gray-600 sm:text-sm">{ad.description}</p>
					<button class="btn btn-xs btn-outline mt-2" on:click={() => openDetailsModal(ad, 'shopping')}>Plus de détails</button>
					{#if ad.status === 'pending' || ad.status === 'Pending'}
						<button
							on:click={() => openDeleteModal('shopping', ad.id)}
							class="btn btn-xs btn-error top-2 right-2"
						>
							Supprimer
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
		{#each deliveryAds as ad}
			<div class="card bg-base-100 mx-auto mt-10 w-full shadow-sm">
				<!-- 1) Carousel d'images -->
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

				<!-- 2) Corps de la carte -->
				<div class="card-body p-4 md:p-6">
					<div>
						<p class="badge badge-info badge-outline mt-2 mr-2 px-3 py-2">Demande de livraison</p>
						<p class="badge badge-neutral mt-2 px-3 py-2">{ad.packageSize}</p>
						{#if ad.status}
							<span class="badge {getStatusColor(ad.status)} mt-2">
								{getStatusLabel(ad.status)}
							</span>
						{/if}
					</div>
					<h2 class="card-title text-sm sm:text-base">{ad.title}</h2>
					<p class="text-xs text-gray-600 sm:text-sm">{ad.description}</p>
					<button class="btn btn-xs btn-outline mt-2" on:click={() => openDetailsModal(ad, 'delivery')}>Plus de détails</button>
					{#if ad.status === 'pending' || ad.status === 'Pending'}
						<button
							on:click={() => openDeleteModal('delivery', ad.id)}
							class="btn btn-xs btn-error top-2 right-2"
						>
							Supprimer
						</button>
					{/if}

					<!-- 3) Étapes -->
					{#if ad.deliverySteps?.length}
						<ul class="steps steps-vertical mt-4 space-y-2">
							{#each ad.deliverySteps as step}
								<li class="step step-primary">
									<strong>Étape {step.stepNumber}:</strong>
									{step.departureLocation.name} → {step.arrivalLocation.name} ({step.price}€)
									{#if step.status}
										<span class="badge {getStatusColor(step.status)} ml-2">
											{getStatusLabel(step.status)}
										</span>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	{#if showModal}
		<div class="modal modal-open">
			<div class="modal-box max-w-xl">
				<h3 class="mb-4 text-lg font-bold">Nouvelle annonce</h3>

				<div class="form-control mb-4">
					<label class="label"><span class="label-text">Type d'annonce</span></label>
					<select bind:value={selectedType} class="select select-bordered w-full">
						<option value="" disabled selected>Sélectionner un type</option>
						<option value="shopping-ads">Liste de courses</option>
						<option value="delivery-request">Demande de livraison</option>
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
							<textarea class="textarea textarea-bordered w-full" bind:value={form_description}
							></textarea>
						</div>

						<div class="form-control">
							<label class="label"><span class="label-text">Images</span></label>
							<input
								type="file"
								accept="image/*"
								multiple
								class="file-input file-input-bordered w-full"
								on:change={handleFilesSelected}
							/>
						</div>

						{#if form_imageUrls.length}
							<div class="grid grid-cols-2 gap-2">
								{#each form_imageUrls as url}
									<img src={url} alt="Preview" class="h-24 rounded border object-cover" />
								{/each}
							</div>
						{/if}

						<div class="form-control">
							<label class="label"><span class="label-text">Ajouter un élément</span></label>
							<div class="flex gap-2">
								<input
									type="text"
									class="input input-bordered w-full"
									bind:value={form_shoppingItem}
								/>
								<button class="btn btn-outline" type="button" on:click={addShoppingItem}
									>Ajouter</button
								>
							</div>
						</div>

						{#if form_shoppingListArray.length}
							<ul class="mt-2 list-inside list-disc space-y-1">
								{#each form_shoppingListArray as item, i}
									<li class="flex items-center justify-between">
										<span>{item}</span>
										<button
											class="btn btn-xs btn-error"
											type="button"
											on:click={() => removeShoppingItem(i)}>X</button
										>
									</li>
								{/each}
							</ul>
						{/if}

						<div class="form-control">
							<label class="label"><span class="label-text">Prix (€)</span></label>
							<input type="number" class="input input-bordered w-full" bind:value={form_price} min={1} />
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
								<label class="label"><span class="label-text">Lieu d'arrivée</span></label>
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
					<div class="space-y-4">
						<!-- Titre -->
						<div class="form-control">
							<label class="label"><span class="label-text">Titre</span></label>
							<input
								type="text"
								class="input input-bordered w-full"
								bind:value={form_delivery.title}
							/>
						</div>

						<!-- Description -->
						<div class="form-control">
							<label class="label"><span class="label-text">Description</span></label>
							<textarea
								class="textarea textarea-bordered w-full"
								bind:value={form_delivery.description}
							></textarea>
						</div>

						<!-- Images -->
						<div class="form-control">
							<label class="label"><span class="label-text">Images</span></label>
							<input
								type="file"
								accept="image/*"
								multiple
								class="file-input file-input-bordered w-full"
								on:change={(e) => handleFiles(e, 'delivery')}
							/>
						</div>

						<!-- Aperçu des images -->
						{#if form_delivery.imageUrls.length}
							<div class="grid grid-cols-2 gap-2">
								{#each form_delivery.imageUrls as url}
									<img src={url} alt="Preview" class="h-24 rounded border object-cover" />
								{/each}
							</div>
						{/if}

						<!-- Date de livraison & taille -->
						<div class="grid grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label"><span class="label-text">Date de livraison</span></label>
								<input
									type="datetime-local"
									class="input input-bordered w-full"
									bind:value={form_delivery.deliveryDate}
									min={new Date().toISOString().slice(0, 16)}
								/>
							</div>
							<div class="form-control">
								<label class="label"><span class="label-text">Taille du colis</span></label>
								<select
									class="select select-bordered w-full"
									bind:value={form_delivery.packageSize}
								>
									<option value="XS">XS</option>
									<option value="S">S</option>
									<option value="M">M</option>
									<option value="XL">XL</option>
									<option value="XXL">XXL</option>
								</select>
							</div>
						</div>

						<!-- Ajout d'étapes -->
						<div class="space-y-2">
							<h4 class="font-semibold">Étapes de livraison</h4>
							<div class="grid grid-cols-1 items-end gap-2 sm:grid-cols-4">
								<input
									type="number"
									placeholder="Prix (€)"
									class="input input-bordered"
									bind:value={form_delivery.newStep.price}
									min={1}
								/>
								<select
									class="select select-bordered"
									bind:value={form_delivery.newStep.departureLocationId}
								>
									<option value={-1} disabled>Départ</option>
									{#each allLocations as loc}
										<option value={loc.id}>
											{loc.name} ({loc.cp})
											{#if loc.public}
												- Public
											{/if}
										</option>
									{/each}
								</select>
								<select
									class="select select-bordered"
									bind:value={form_delivery.newStep.arrivalLocationId}
								>
									<option value={-1} disabled>Arrivée</option>
									{#each allLocations as loc}
										<option value={loc.id}>
											{loc.name} ({loc.cp})
											{#if loc.public}
												- Public
											{/if}
										</option>
									{/each}
								</select>
								<button type="button" class="btn btn-outline" on:click={addDeliveryStep}>
									Ajouter étape
								</button>
							</div>

							<!-- Aperçu des étapes -->
							{#if form_delivery.steps.length}
								<div class="space-y-1 pt-2">
									{#each form_delivery.steps as step, i (step.stepNumber)}
										<div class="bg-base-100 flex items-center justify-between rounded p-2 shadow">
											<div>
												<strong>Étape {step.stepNumber}:</strong>
												{step.price}€
												<span class="text-sm">
													({allLocations.find((l) => l.id === step.departureLocationId)?.name}
													→ {allLocations.find((l) => l.id === step.arrivalLocationId)?.name})
												</span>
											</div>
											<button
												type="button"
												class="btn btn-xs btn-error"
												on:click={() => removeDeliveryStep(i)}
											>
												×
											</button>
										</div>

										{#if i < form_delivery.steps.length - 1}
											<!-- flèche vers le bas -->
											<div class="my-1 flex justify-center">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-5 w-5 text-gray-500"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 9l-7 7-7-7"
													/>
												</svg>
											</div>
										{/if}
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<div class="modal-action mt-6">
					<button class="btn" on:click={() => (showModal = false)}>Annuler</button>
					{#if selectedType === 'shopping-ads' || selectedType === 'delivery-request'}
						<button class="btn btn-primary" on:click={handleCreate}>Créer</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}

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

	{#if showDetailsModal && selectedAd}
		<div class="modal modal-open">
			<div class="modal-box max-w-2xl">
				<h3 class="text-lg font-bold mb-4">Détails de l'annonce</h3>
				{#if selectedAdType === 'shopping'}
					<!-- Détails pour une annonce de course -->
					<div class="flex flex-col md:flex-row md:justify-between gap-6">
						<div>
							<p class="font-semibold mb-1">📍 Départ</p>
							<p>{selectedAd.departureLocation?.name}</p>
							<p>{selectedAd.departureLocation?.address}</p>
							<p>{selectedAd.departureLocation?.cp} {selectedAd.departureLocation?.city}, {selectedAd.departureLocation?.country}</p>
						</div>
						<div class="flex items-center justify-center text-2xl text-gray-400">→</div>
						<div>
							<p class="font-semibold mb-1">🎯 Arrivée</p>
							<p>{selectedAd.arrivalLocation?.name}</p>
							<p>{selectedAd.arrivalLocation?.address}</p>
							<p>{selectedAd.arrivalLocation?.cp} {selectedAd.arrivalLocation?.city}, {selectedAd.arrivalLocation?.country}</p>
						</div>
					</div>
					<p class="mt-4 font-semibold">📦 Taille du colis</p>
					<p>{selectedAd.packageSize}</p>
					<p class="mt-4 font-semibold">🛒 Liste de course</p>
					<ul class="list-disc ml-6">
						{#each selectedAd.shoppingList ?? [] as item}
							<li>{item}</li>
						{/each}
					</ul>
				{/if}
				{#if selectedAdType === 'delivery'}
					<p class="font-semibold mb-1">📦 Taille du colis</p>
					<p>{selectedAd.packageSize}</p>
					<p class="font-semibold mt-2">🚚 Étapes</p>
					{#if deliveryStepsLoading}
						<p>Chargement des étapes...</p>
					{:else if deliveryStepsDetails.length === 0}
						<p>Aucune étape trouvée.</p>
					{:else}
						<ul class="list-disc ml-6">
							{#each deliveryStepsDetails as step}
								<li class="mb-2">
									<strong>Étape {step.stepNumber}</strong> :
									Départ : {step.departureLocation?.name}, {step.departureLocation?.address}
									→ Arrivée : {step.arrivalLocation?.name}, {step.arrivalLocation?.address}
									({step.price}€)
									<span class="ml-2">[{step.status}]</span>
								</li>
							{/each}
						</ul>
					{/if}
				{/if}
				<div class="modal-action mt-6">
					<button class="btn" on:click={closeDetailsModal}>Fermer</button>
				</div>
			</div>
		</div>
	{/if}
</div>
