<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';

	const title = t('app.providers.my_announces.title');
	const modify = t('app.providers.my_announces.modify');
	const cancel = t('app.providers.my_announces.cancel');
	const details = t('app.providers.my_announces.details');
	const add_new_ads = t('app.providers.my_announces.add_new_ads');
	import { onDestroy, onMount } from 'svelte';

	onMount(() => onDestroy(tabTitle('app.providers.service')));

	const announcements = [
		{
			id: 1,
			type: 'Prestataire pro',
			price: '75 €',
			title: 'Jardinage et élagage sur Paris',
			description:
				"je m'occupe de votre jardin comme personne, vous voudrez y aller même en hiver ! ",
			image: null
		},
		{
			id: 2,
			type: 'Particulier',
			price: '75 €',
			title: 'Jardinage et élagage sur Paris',
			description:
				"je m'occupe de votre jardin comme personne, vous voudrez y aller même en hiver ! ",
			image: null
		},
		{
			id: 3,
			type: 'Particulier',
			price: '75 €',
			title: 'Jardinage et élagage sur Paris',
			description:
				"je m'occupe de votre jardin comme personne, vous voudrez y aller même en hiver ! ",
			image: null
		}
	];

	function handleEditAnnouncement(id: number) {
		alert(`Modifier l'annonce ${id}`);
	}

	function handleViewDetails(id: number) {
		alert(`Voir les détails de l'annonce ${id}`);
	}

	function handleCancelAnnouncement(id: number) {
		alert(`Annuler l'annonce ${id}`);
	}

	function handleAddAnnouncement() {
		alert('Ajouter une nouvelle annonce');
	}
</script>

<div class="bg-base-200 min-h-screen p-4 md:p-6">
	<div class="mx-auto max-w-7xl">
		<h1 class="font-author mb-4 text-2xl text-gray-800 md:mb-6">{$title}</h1>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
			{#each announcements as announcement}
				<div class="card bg-base-100 mx-auto w-full shadow-sm">
					<figure class="flex h-40 items-center justify-center bg-gray-200 sm:h-48">
						{#if announcement.image}
							<img
								src={announcement.image}
								alt={announcement.title}
								class="h-full w-full object-cover"
							/>
						{:else}
							<span class="text-gray-500">Aucune photo disponible</span>
						{/if}
					</figure>

					<div class="card-body p-4 md:p-6">
						<div class="mb-3 flex flex-wrap items-center gap-2">
							<button class="btn btn-outline btn-neutral btn-xs sm:btn-sm">
								{announcement.type}
							</button>
							<button class="btn btn-neutral btn-info btn-xs sm:btn-sm">
								{announcement.price}
							</button>
						</div>

						<h2 class="card-title text-sm sm:text-base">{announcement.title}</h2>
						<p class="text-xs text-gray-600 sm:text-sm">{announcement.description}</p>

						<div class="card-actions mt-4 flex flex-wrap justify-start gap-1 sm:gap-2">
							<button
								on:click={() => handleEditAnnouncement(announcement.id)}
								class="btn btn-primary btn-xs sm:btn-sm rounded-md"
							>
								{$modify}
							</button>
							<button
								on:click={() => handleViewDetails(announcement.id)}
								class="btn btn-neutral-content btn-xs sm:btn-sm rounded-md"
							>
								{$details}
							</button>
							<button
								on:click={() => handleCancelAnnouncement(announcement.id)}
								class="btn btn-error btn-xs sm:btn-sm rounded-md"
							>
								{$cancel}
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-6 text-center md:mt-8">
			<button on:click={handleAddAnnouncement} class="btn btn-primary btn-sm sm:btn-md rounded-md">
				{$add_new_ads}
			</button>
		</div>

		<div class="mt-4 text-center text-sm text-green-600 sm:text-base md:mt-6">
			// à définir dans le back message de confirmation
		</div>
	</div>
</div>
