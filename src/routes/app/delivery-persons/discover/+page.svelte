<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	const all_services = t('app.delivery.announce.all_services');
	const delivery = t('app.delivery.announce.delivery');
	const transport = t('app.delivery.announce.transport');
	const city = t('app.delivery.announce.city');
	const contact = t('app.delivery.announce.contact');
	const details = t('app.delivery.announce.details');

	import { onDestroy, onMount } from 'svelte';

	onMount(() => onDestroy(tabTitle('app.clients.discover')));

	interface Service {
		id: number;
		type: 'transport' | 'livraison';
		userType: 'particulier' | 'commerçant';
		title: string;
		description: string;
		price: number;
		image: string | null;
	}

	let selectedService = 'Transport';
	let searchCity = '';
	let showServiceMenu = false;

	// Données des services
	let services: Service[] = [
		{
			id: 1,
			type: 'transport',
			userType: 'particulier',
			title: 'Transport de colis en France',
			description: "J'aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.",
			price: 140,
			image: '/placeholder.svg?height=200&width=300'
		},
		{
			id: 2,
			type: 'livraison',
			userType: 'commerçant',
			title: 'Livraison de moins de 10km',
			description: 'Livraison de produit frais de notre boutique vers le client (5km).',
			price: 420,
			image: null
		},
		{
			id: 3,
			type: 'transport',
			userType: 'particulier',
			title: 'Transport de colis en France',
			description: "J'aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.",
			price: 140,
			image: '/placeholder.svg?height=200&width=300'
		},
		{
			id: 4,
			type: 'livraison',
			userType: 'commerçant',
			title: 'Livraison de moins de 10km',
			description: 'Livraison de produit frais de notre boutique vers le client (5km).',
			price: 420,
			image: null
		},
		{
			id: 5,
			type: 'transport',
			userType: 'particulier',
			title: 'Transport de colis en France',
			description: "J'aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.",
			price: 140,
			image: '/placeholder.svg?height=200&width=300'
		},
		{
			id: 6,
			type: 'livraison',
			userType: 'commerçant',
			title: 'Livraison de moins de 10km',
			description: 'Livraison de produit frais de notre boutique vers le client (5km).',
			price: 420,
			image: null
		}
	];

	function toggleServiceMenu() {
		showServiceMenu = !showServiceMenu;
	}

	function selectService(service: string) {
		selectedService = service;
		showServiceMenu = false;
	}

	function handleContact(id: number) {
		console.log(`Contacter pour le service ${id}`);
	}

	function handleDetails(id: number) {
		console.log(`Voir détails du service ${id}`);
	}
</script>

<div class="bg-base-200 min-h-screen p-4 md:p-6">
	<div class="mx-auto max-w-7xl">
		<!-- Filtres -->
		<div class="relative mb-6 flex gap-4">
			<div class="relative w-64">
				<button
					on:click={toggleServiceMenu}
					class="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white p-2"
				>
					{selectedService}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
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
				</button>

				{#if showServiceMenu}
					<div class="fixed inset-0 z-40" on:click={() => (showServiceMenu = false)}></div>
					<div
						class="absolute top-full left-0 z-50 mt-1 w-full overflow-visible rounded-md border border-gray-300 bg-white shadow-lg"
					>
						<div
							class="cursor-pointer p-2 hover:bg-gray-100"
							on:click={() => selectService('Tous les services')}
						>
							{$all_services}
						</div>
						<div
							class="bg-primary cursor-pointer p-2 text-white"
							on:click={() => selectService('Transport')}
						>
							{$transport}
						</div>
						<div
							class="cursor-pointer p-2 hover:bg-gray-100"
							on:click={() => selectService('Livraison')}
						>
							{$delivery}
						</div>
					</div>
				{/if}
			</div>

			<input
				type="text"
				placeholder="Ville"
				bind:value={searchCity}
				class="flex-grow rounded-md border border-gray-300 p-2"
			/>
		</div>

		<!-- Liste des services -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
			{#each services as service}
				<div class="card bg-base-100 mx-auto w-full shadow-sm">
					<figure class="flex h-40 items-center justify-center bg-gray-200 sm:h-48">
						{#if service.image}
							<img
								src={service.image || '/placeholder.svg'}
								alt={service.title}
								class="h-full w-full object-cover"
							/>
						{:else}
							<div class="flex h-full w-full items-center justify-center bg-blue-600">
								<span class="text-2xl font-bold text-white">biocoop</span>
							</div>
						{/if}
					</figure>

					<div class="card-body p-4 md:p-6">
						<div class="mb-3 flex flex-wrap items-center gap-2">
							<button class="btn btn-outline btn-neutral btn-xs sm:btn-sm">
								{service.userType === 'particulier' ? 'Particulier' : 'Commerçant'}
							</button>
							<button class="btn btn-neutral btn-info btn-xs sm:btn-sm">
								{service.price} €
							</button>
						</div>

						<h2 class="card-title text-sm sm:text-base">{service.title}</h2>
						<p class="text-xs text-gray-600 sm:text-sm">{service.description}</p>

						<div class="card-actions mt-4 flex flex-wrap justify-start gap-1 sm:gap-2">
							<button
								on:click={() => handleContact(service.id)}
								class="btn btn-primary btn-xs sm:btn-sm rounded-md"
							>
								{$contact}
							</button>
							<button
								on:click={() => handleDetails(service.id)}
								class="btn btn-neutral-content btn-xs sm:btn-sm rounded-md"
							>
								{$details}
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
