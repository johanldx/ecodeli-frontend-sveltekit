<script lang="ts">
	import { t, tStatic } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';
	import { accessToken } from '$lib/stores/token';
	import { get } from 'svelte/store';
	import { fetchFromAPI } from '$lib/utils/api';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';
	import { notifications } from '$lib/stores/notifications';

	const page_title = t('app.delivery-persons.discover.tab_title');
	const all_label = t('app.delivery-persons.discover.all_services');
	const shopping_label = t('app.delivery-persons.discover.shopping');
	const delivery_label = t('app.delivery-persons.discover.delivery');
	const contact_label = t('app.delivery-persons.discover.contact');
	const city_placeholder = t('app.delivery-persons.discover.city');
	const cart_release_label = t('app.traders.requests.cart_release');
	const no_photo_available = t('landing.global.common.no_photo_available');
	const shopping_list = t('landing.global.forms.shopping_list');
	const delivery_request = t('landing.global.forms.delivery_request');
	const date_label = t('landing.global.common.date');
	const departure_label = t('landing.global.common.departure');
	const arrival_label = t('landing.global.common.arrival');
	const step_label = t('landing.global.common.step');
	const conversation_creation_error = t('app.delivery-persons.discover.notifications.conversation_creation_error');
	const already_contacted = t('landing.global.notifications.already_contacted');
	const stats_in_progress = t('landing.global.stats.in_progress');
	const stats_completed = t('landing.global.stats.completed');

	const ALL_LABEL = $all_label;
	const SHOPPING_LABEL = $shopping_label;
	const DELIVERY_LABEL = $delivery_label;
	const CONTACT_LABEL = $contact_label;
	const CITY_PLACEHOLDER = $city_placeholder;

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
		status: string;
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
		status: string;
		departureLocation: Location;
		arrivalLocation: Location;
		stepNumber: number;
	}

	interface ReleaseCartAd {
		id: number;
		title: string;
		description: string;
		price: number;
		packageSize: string;
		imageUrls: string[];
		status: string;
		departureLocation: Location;
		arrivalLocation: Location;
	}

	let dataLoaded = false;

	let filterType: 'all' | 'shopping' | 'delivery' | 'release' = 'all';
	let cityQuery = '';
	let shoppingAds: ShoppingAd[] = [];
	let steps: DeliveryStep[] = [];
	let releases: ReleaseCartAd[] = [];

	onMount(() => onDestroy(tabTitle($page_title)));

	onMount(async () => {
		await loadData();
		dataLoaded = true;
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

		// 3) Release Cart Ads
		releases = await fetchFromAPI<ReleaseCartAd[]>('/release-cart-ads', {
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
					status: ad.status ?? '',
					departureLocation: dep,
					arrivalLocation: arr,
					stepNumber: s.stepNumber ?? s.step_number
				});
			}
		}
	}

	$: filteredShopping = dataLoaded
		? shoppingAds.filter(
				(ad) =>
					(filterType === 'all' || filterType === 'shopping') &&
					ad.status === 'pending' &&
					(!cityQuery ||
						ad.departureLocation.city.toLowerCase().includes(cityQuery.toLowerCase()) ||
						ad.arrivalLocation.city.toLowerCase().includes(cityQuery.toLowerCase()))
			)
		: [];

	$: filteredSteps = dataLoaded
		? steps.filter(
				(st) =>
					(filterType === 'all' || filterType === 'delivery') &&
					st.status === 'pending' &&
					(!cityQuery ||
						st.departureLocation.city.toLowerCase().includes(cityQuery.toLowerCase()) ||
						st.arrivalLocation.city.toLowerCase().includes(cityQuery.toLowerCase()))
			)
		: [];

	$: filteredReleases = dataLoaded
		? releases.filter(
				(ad) =>
					(filterType === 'all' || filterType === 'release') &&
					ad.status === 'pending' &&
					(!cityQuery ||
						ad.departureLocation.city.toLowerCase().includes(cityQuery.toLowerCase()) ||
						ad.arrivalLocation.city.toLowerCase().includes(cityQuery.toLowerCase()))
			)
		: [];

	// Compteurs pour les statistiques
	$: shoppingInProgressCount = dataLoaded ? shoppingAds.filter(ad => ad.status === 'in_progress').length : 0;
	$: shoppingCompletedCount = dataLoaded ? shoppingAds.filter(ad => ad.status === 'completed').length : 0;
	$: stepsInProgressCount = dataLoaded ? steps.filter(step => step.status === 'in_progress').length : 0;
	$: stepsCompletedCount = dataLoaded ? steps.filter(step => step.status === 'completed').length : 0;
	$: releasesInProgressCount = dataLoaded ? releases.filter(ad => ad.status === 'in_progress').length : 0;
	$: releasesCompletedCount = dataLoaded ? releases.filter(ad => ad.status === 'completed').length : 0;
	$: totalInProgress = shoppingInProgressCount + stepsInProgressCount + releasesInProgressCount;
	$: totalCompleted = shoppingCompletedCount + stepsCompletedCount + releasesCompletedCount;

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
					price: ad.price,
					userFrom: currentUser.id
				})
			});

			console.log(
				JSON.stringify({
					adType: 'ShoppingAds',
					adId: ad.id,
					status: 'pending',
					price: ad.price,
					userFrom: currentUser.id
				})
			);
			goto(`/app/delivery-persons/chat?id=${convId}`);
		} catch (err: any) {
			console.error('Erreur création conversation', err);
			if (err.status === 403 && err.message?.includes('conversation existe déjà')) {
				notifications.error($already_contacted);
			} else {
				notifications.error($conversation_creation_error);
			}
		}
	}

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
					adId: step.id,
					status: 'pending',
					price: step.price,
					userFrom: currentUser.id
				})
			});
			goto(`/app/delivery-persons/chat?id=${convId}`);
		} catch (err: any) {
			console.error('Erreur création conversation', err);
			if (err.status === 403 && err.message?.includes('conversation existe déjà')) {
				notifications.error($already_contacted);
			} else {
				notifications.error($conversation_creation_error);
			}
		}
	}

	async function handleContactRelease(ad: ReleaseCartAd) {
		const token = get(accessToken);
		const currentUser = get(user)!;
		console.log(ad);
		try {
			const { id: convId } = await fetchFromAPI<{ id: number }>('/conversations', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					adType: 'ReleaseCartAds',
					adId: ad.id,
					status: 'pending',
					price: ad.price,
					userFrom: currentUser.id
				})
			});
			goto(`/app/delivery-persons/chat?id=${convId}`);
		} catch (err: any) {
			console.error('Erreur création conversation', err);
			if (err.status === 403 && err.message?.includes('conversation existe déjà')) {
				notifications.error($already_contacted);
			} else {
				notifications.error($conversation_creation_error);
			}
		}
	}
</script>

<div class="bg-base-200 p-4 md:p-6">
	<!-- Filters -->
	<div class="mb-6 flex gap-4">
		<select bind:value={filterType} class="select select-bordered">
			<option value="all">{$all_label}</option>
			<option value="shopping">{$shopping_label}</option>
			<option value="delivery">{$delivery_label}</option>
			<option value="release">{$cart_release_label}</option>
		</select>
		<input
			type="text"
			placeholder={$city_placeholder}
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
						<span class="text-gray-500">{$no_photo_available}</span>
					</figure>
				{/if}
				<div class="card-body p-4 md:p-6">
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<span class="badge badge-neutral badge-outline px-3 py-2">{$shopping_list}</span>
						<span class="badge">{ad.price} €</span>
						<span class="badge">{ad.packageSize}</span>
					</div>
					<h2 class="card-title">{ad.title}</h2>
					<p class="text-sm text-gray-600">{ad.description}</p>
					<p class="mt-1 text-xs">
						<strong>{$date_label}:</strong>
						{ad.deliveryDate ? new Date(ad.deliveryDate).toLocaleDateString() : '—'}
					</p>
					<p class="mt-1 text-xs">
						<strong>{$departure_label}:</strong>
						{ad.departureLocation.name}, {ad.departureLocation.city}
					</p>
					<p class="text-xs">
						<strong>{$arrival_label}:</strong>
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
						{$contact_label}
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
						<span class="text-gray-500">{$no_photo_available}</span>
					</figure>
				{/if}
				<div class="card-body p-4 md:p-6">
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<span class="badge badge-info badge-outline px-3 py-2">{$delivery_request}</span>
						<span class="badge">{step.price} €</span>
						<span class="badge">{step.packageSize}</span>
					</div>
					<h2 class="card-title">{step.title}</h2>
					<p class="text-sm text-gray-600">{step.description}</p>
					<p class="mt-1 text-xs">
						<strong>{$date_label}:</strong>
						{step.deliveryDate ? new Date(step.deliveryDate).toLocaleDateString() : '—'}
					</p>
					<p class="mt-1 text-xs">
						<strong>{$step_label} {step.stepNumber}:</strong>
						{step.departureLocation.name}, {step.departureLocation.city} →
						{step.arrivalLocation.name}, {step.arrivalLocation.city}
					</p>
					<button class="btn btn-primary btn-sm mt-4" on:click={() => handleContactStep(step)}>
						{$contact_label}
					</button>
				</div>
			</div>
		{/each}

		<!-- Release Cart Ads -->
		{#each filteredReleases as ad}
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
						<span class="text-gray-500">{$no_photo_available}</span>
					</figure>
				{/if}
				<div class="card-body p-4 md:p-6">
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<span class="badge badge-accent badge-outline px-3 py-2">{$cart_release_label}</span>
						<span class="badge">{ad.price} €</span>
						<span class="badge">{ad.packageSize}</span>
					</div>
					<h2 class="card-title">{ad.title}</h2>
					<p class="text-sm text-gray-600">{ad.description}</p>
					<p class="mt-1 text-xs">
						<strong>{$departure_label}:</strong>
						{ad.departureLocation.name}, {ad.departureLocation.city}
					</p>
					<p class="text-xs">
						<strong>{$arrival_label}:</strong>
						{ad.arrivalLocation.name}, {ad.arrivalLocation.city}
					</p>
					<button class="btn btn-primary btn-sm mt-4" on:click={() => handleContactRelease(ad)}>
						{$contact_label}
					</button>
				</div>
			</div>
		{/each}
	</div>

	<!-- Statistiques en bas de page -->
	{#if dataLoaded}
		<div class="mt-8 text-center text-sm text-gray-600">
			<p>{totalInProgress} {$stats_in_progress}</p>
			<p>{totalCompleted} {$stats_completed}</p>
		</div>
	{/if}
</div>
