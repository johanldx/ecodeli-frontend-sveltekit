<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
	import { user } from '$lib/stores/user';
	import { fetchFromAPI } from '$lib/utils/api';
	import { goto } from '$app/navigation';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { notifications } from '$lib/stores/notifications';

	interface PersonalServiceType {
		id: number;
		name: string;
	}

	interface PersonalServiceAd {
		id: number;
		title: string;
		description: string;
		imageUrls: string[];
		postedById: number;
		typeId: number;
		createdAt: string;
		editedAt: string;
	}

	let dataLoaded = false;

	let selectedTypeId: string = 'all';

	let personalServiceTypes: PersonalServiceType[] = [];
	let personalServiceAds: PersonalServiceAd[] = [];

	onMount(() => onDestroy(tabTitle('app.clients.discover.tab_title')));

	onMount(async () => {
		await loadData();
		dataLoaded = true;
	});

	async function loadData() {
		const token = get(accessToken);
		personalServiceTypes = await fetchFromAPI<PersonalServiceType[]>('/personal-service-types', {
			headers: { Authorization: `Bearer ${token}` }
		});
		personalServiceAds = await fetchFromAPI<PersonalServiceAd[]>('/personal-service-ads', {
			headers: { Authorization: `Bearer ${token}` }
		});
	}

	function getTypeName(typeId: number | undefined): string {
		if (typeId === undefined || typeId === null) return '—';
		const found = personalServiceTypes.find((t) => t.id === typeId);
		return found ? found.name : '—';
	}

	$: filteredAds = dataLoaded
		? personalServiceAds.filter((ad) => {
				if (selectedTypeId === 'all') return true;
				return ad.typeId === Number(selectedTypeId);
			})
		: [];

	async function handleContact(ad: PersonalServiceAd) {
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
					adType: 'ServiceProvisions',
					adId: ad.id,
					status: 'pending',
					price: 0,
					userFrom: currentUser.id
				})
			});
			goto(`/app/clients/chat?id=${convId}`);
		} catch (err) {
			notifications.error((err as Error).message);
		}
	}
</script>

<div class="bg-base-200 p-4 md:p-6">
	<div class="mb-6 flex items-center gap-4">
		<select id="typeFilter" bind:value={selectedTypeId} class="select select-bordered max-w-xs">
			<option value="all">Tous</option>
			{#each personalServiceTypes as type}
				<option value={type.id.toString()}>{type.name}</option>
			{/each}
		</select>
	</div>

	{#if dataLoaded}
		{#if filteredAds.length === 0}
			<p class="text-center text-gray-600">Aucune annonce trouvée pour ce filtre.</p>
		{:else}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{#each filteredAds as ad}
					<div class="card bg-base-100 mx-auto w-full shadow-sm">
						{#if ad.imageUrls?.length > 0}
							<div class="carousel h-40 w-full rounded-t-lg sm:h-48">
								{#each ad.imageUrls as url, i}
									<div id={`item-ad-${ad.id}-${i}`} class="carousel-item relative w-full">
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
												.getElementById(`item-ad-${ad.id}-${i}`)
												?.scrollIntoView({ behavior: 'smooth', inline: 'start' })}
									>
										{i + 1}
									</button>
								{/each}
							</div>
						{:else}
							<figure
								class="flex h-40 items-center justify-center rounded-t-lg bg-gray-200 sm:h-48"
							>
								<span class="text-gray-500">Aucune photo disponible</span>
							</figure>
						{/if}
						<div class="card-body p-4 md:p-6">
							<div class="mb-2 flex flex-wrap items-center gap-2">
								<span class="badge badge-primary badge-outline px-3 py-2"
									>{getTypeName(ad.typeId)}</span
								>
							</div>
							<h2 class="card-title">{ad.title}</h2>
							<p class="text-sm text-gray-600">{ad.description}</p>
							<button class="btn btn-primary btn-sm mt-4" on:click={() => handleContact(ad)}>
								Contacter
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		<p class="text-center">Chargement des annonces...</p>
	{/if}
</div>
