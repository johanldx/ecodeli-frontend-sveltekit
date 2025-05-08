<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';
	import { accessToken } from '$lib/stores/token';
	import { get } from 'svelte/store';
	import { fetchFromAPI } from '$lib/utils/api';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';

	// Labels
	const ALL_LABEL = 'Tout';
	const SHOPPING_LABEL = 'Shopping';
	const DELIVERY_LABEL = 'Livraison';
	const CONTACT_LABEL = 'Contacter';
	const CITY_PLACEHOLDER = t('app.delivery.announce.city');

	interface Location {
		id: number;
		name: string;
		city: string;
	}

	interface ShoppingAd {
		id: number;
		title: string;
		description: string;
		price: number;
		packageSize: string;
		deliveryDate: string;
		imageUrls: string[];
		departureLocation: Location;
		arrivalLocation: Location;
		shoppingList: string[];
	}

	interface DeliveryStep {
		id: number;
		deliveryAdId: number;
		title: string;
		description: string;
		price: number;
		packageSize: string;
		deliveryDate: string;
		imageUrls: string[];
		departureLocation: Location;
		arrivalLocation: Location;
		stepNumber: number;
	}

	// Filter state
	let filterType: 'all' | 'shopping' | 'delivery' = 'all';
	let cityQuery = '';
	let shoppingAds: ShoppingAd[] = [];
	let steps: DeliveryStep[] = [];

	onMount(async () => {
		onDestroy(tabTitle('app.clients.discover'));
		await loadData();
	});

	async function loadData() {
		const token = get(accessToken);

		// 1) Shopping Ads
		shoppingAds = await fetchFromAPI<ShoppingAd[]>('/shopping-ads', {
			headers: { Authorization: `Bearer ${token}` }
		});

		// 2) Delivery Ads → Steps
		const deliveryAds = await fetchFromAPI<any[]>('/delivery-ads', {
			headers: { Authorization: `Bearer ${token}` }
		});

		steps = [];
		for (const ad of deliveryAds) {
			const rawSteps = await fetchFromAPI<any[]>(`/delivery-steps/delivery-ad/${ad.id}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			for (const s of rawSteps) {
				const dep: Location = await fetchFromAPI<Location>(`/locations/${s.departureLocationId}`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				const arr: Location = await fetchFromAPI<Location>(`/locations/${s.arrivalLocationId}`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				steps.push({
					id: s.id,
					deliveryAdId: ad.id,
					title: ad.title,
					description: ad.description,
					price: s.price,
					packageSize: ad.packageSize ?? ad.package_size ?? '—',
					deliveryDate: ad.deliveryDate ?? ad.delivery_date ?? '',
					imageUrls: ad.imageUrls ?? ad.image_urls ?? [],
					departureLocation: dep,
					arrivalLocation: arr,
					stepNumber: s.stepNumber ?? s.step_number
				});
			}
		}
	}

	// Compute filtered lists
	$: filteredShopping = shoppingAds.filter(
		(ad) =>
			(filterType === 'all' || filterType === 'shopping') &&
			(!cityQuery ||
				ad.departureLocation.city.toLowerCase().includes(cityQuery.toLowerCase()) ||
				ad.arrivalLocation.city.toLowerCase().includes(cityQuery.toLowerCase()))
	);

	$: filteredSteps = steps.filter(
		(st) =>
			(filterType === 'all' || filterType === 'delivery') &&
			(!cityQuery ||
				st.departureLocation.city.toLowerCase().includes(cityQuery.toLowerCase()) ||
				st.arrivalLocation.city.toLowerCase().includes(cityQuery.toLowerCase()))
	);

	// --- Shopping : price = ad.price
	async function handleContactShopping(ad: ShoppingAd) {
		const token = get(accessToken);
		const currentUser = get(user)!;
		try {
			const { id: convId } = await fetchFromAPI<{ id: number }>('/conversations', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					adType: 'ShoppingAds',
					adId: ad.id,
					status: 'pending',
					price: ad.price, // ← prix de l'annonce shopping
					userFrom: currentUser.id
				})
			});

			console.log(JSON.stringify({
					adType: 'ShoppingAds',
					adId: ad.id,
					status: 'pending',
					price: ad.price, // ← prix de l'annonce shopping
					userFrom: currentUser.id
				}));
			goto(`/app/delivery-persons/chat?id=${convId}`);
		} catch (err) {
			console.error('Erreur création conversation', err);
		}
	}

	// --- Delivery Step : adId = step.deliveryAdId, price = prix de l'annonce (ici on utilise step.price)
	async function handleContactStep(step: DeliveryStep) {
		const token = get(accessToken);
		const currentUser = get(user)!;
		try {
			const { id: convId } = await fetchFromAPI<{ id: number }>('/conversations', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					adType: 'DeliverySteps',
					adId: step.deliveryAdId,
					status: 'pending',
					price: step.price, // ← prix de l'annonce delivery (step.price)
					userFrom: currentUser.id
				})
			});
			goto(`/delivery-persons/chat?id=${convId}`);
		} catch (err) {
			console.error('Erreur création conversation', err);
		}
	}
</script>

<div class="bg-base-200 min-h-screen p-4 md:p-6">
	<!-- Filters -->
	<div class="mb-6 flex gap-4">
		<select bind:value={filterType} class="select select-bordered">
			<option value="all">{ALL_LABEL}</option>
			<option value="shopping">{SHOPPING_LABEL}</option>
			<option value="delivery">{DELIVERY_LABEL}</option>
		</select>
		<input
			type="text"
			placeholder={$CITY_PLACEHOLDER}
			bind:value={cityQuery}
			class="input input-bordered flex-1"
		/>
	</div>

	<!-- Cards Grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		<!-- Shopping Ads -->
		{#each filteredShopping as ad}
			<div class="card bg-base-100 mx-auto w-full shadow-sm">
				{#if ad.imageUrls?.length > 0}
					<div class="carousel h-40 w-full rounded-t-lg sm:h-48">
						{#each ad.imageUrls as url, i}
							<div id={`item-shop-${ad.id}-${i}`} class="carousel-item relative w-full">
								<img
									src={url}
									alt={`Image ${i + 1}`}
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
								on:click={() =>
									document
										.getElementById(`item-shop-${ad.id}-${i}`)
										?.scrollIntoView({ behavior: 'smooth', inline: 'start' })}
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
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<span class="badge badge-neutral badge-outline px-3 py-2">Liste de courses</span>
						<span class="badge">{ad.price} €</span>
						<span class="badge">{ad.packageSize}</span>
					</div>
					<h2 class="card-title">{ad.title}</h2>
					<p class="text-sm text-gray-600">{ad.description}</p>
					<p class="mt-1 text-xs">
						<strong>Date:</strong>
						{ad.deliveryDate ? new Date(ad.deliveryDate).toLocaleDateString() : '—'}
					</p>
					<p class="mt-1 text-xs">
						<strong>Départ:</strong>
						{ad.departureLocation.name}, {ad.departureLocation.city}
					</p>
					<p class="text-xs">
						<strong>Arrivée:</strong>
						{ad.arrivalLocation.name}, {ad.arrivalLocation.city}
					</p>
					{#if ad.shoppingList.length}
						<ul class="mt-2 list-inside list-disc text-xs">
							{#each ad.shoppingList as item}
								<li>{item}</li>
							{/each}
						</ul>
					{/if}
					<button class="btn btn-primary btn-sm mt-4" on:click={() => handleContactShopping(ad)}>
						{CONTACT_LABEL}
					</button>
				</div>
			</div>
		{/each}

		<!-- Delivery Steps -->
		{#each filteredSteps as step}
			<div class="card bg-base-100 mx-auto w-full shadow-sm">
				{#if step.imageUrls?.length > 0}
					<div class="carousel h-40 w-full rounded-t-lg sm:h-48">
						{#each step.imageUrls as url, i}
							<div id={`item-step-${step.id}-${i}`} class="carousel-item relative w-full">
								<img
									src={url}
									alt={`Image ${i + 1}`}
									class="h-full w-full rounded-t-lg object-cover"
									loading="lazy"
								/>
								<div
									class="bg-opacity-50 absolute right-2 bottom-2 rounded bg-black px-2 py-1 text-xs text-white"
								>
									{i + 1}/{step.imageUrls.length}
								</div>
							</div>
						{/each}
					</div>
					<div class="mt-2 flex justify-center gap-2">
						{#each step.imageUrls as _, i}
							<button
								class="btn btn-xs"
								on:click={() =>
									document
										.getElementById(`item-step-${step.id}-${i}`)
										?.scrollIntoView({ behavior: 'smooth', inline: 'start' })}
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
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<span class="badge badge-info badge-outline px-3 py-2">Demande de livraison</span>
						<span class="badge">{step.price} €</span>
						<span class="badge">{step.packageSize}</span>
					</div>
					<h2 class="card-title">{step.title}</h2>
					<p class="text-sm text-gray-600">{step.description}</p>
					<p class="mt-1 text-xs">
						<strong>Date:</strong>
						{step.deliveryDate ? new Date(step.deliveryDate).toLocaleDateString() : '—'}
					</p>
					<p class="mt-1 text-xs">
						<strong>Étape {step.stepNumber}:</strong>
						{step.departureLocation.name}, {step.departureLocation.city} →
						{step.arrivalLocation.name}, {step.arrivalLocation.city}
					</p>
					<button class="btn btn-primary btn-sm mt-4" on:click={() => handleContactStep(step)}>
						{CONTACT_LABEL}
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
