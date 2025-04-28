<script>
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';

	const all_services = t('app.clients.discover.all_services');
	const taxi = t('app.clients.discover.taxi');
	const gardening = t('app.clients.discover.gardening');
	const childcare = t('app.clients.discover.childcare');
	const professional_service_provider = t('app.clients.discover.professional_service_provider');
	const contact = t('app.clients.discover.contact');
	const details = t('app.clients.discover.details');
	import { onDestroy, onMount } from 'svelte';

	onMount(() => onDestroy(tabTitle('app.clients.discover')));

	let services = [
		{
			id: 1,
			category: 'Taxi',
			title: 'Transport à l’aéroport',
			price: 62,
			description: "Nous transportons de 1 à 4 personnes depuis toute l'IDF vers CDG et Orly.",
			image: '/taxi.jpg'
		},
		{
			id: 2,
			category: 'Jardinage',
			title: 'Entretien de jardin',
			price: 50,
			description: 'Tonte de pelouse, taille des haies et entretien des espaces verts.',
			image: '/jardinage.jpg'
		},
		{
			id: 3,
			category: "Garde d'enfant",
			title: 'Baby-sitting',
			price: 30,
			description: 'Garde d’enfants à domicile en toute confiance.',
			image: '/garde.jpg'
		},
		{
			id: 4,
			category: 'Taxi',
			title: 'Trajet longue distance',
			price: 80,
			description: 'Transport longue distance avec confort et sécurité.',
			image: '/taxi2.jpg'
		}
	];

	let selectedCategory = 'Tous les services';

	$: filteredServices =
		selectedCategory === 'Tous les services'
			? services
			: services.filter((s) => s.category === selectedCategory);

	/**
	 * @param {{ id?: number; category?: string; title: any; price?: number; description?: string; image?: string; }} service
	 */
	function handleContact(service) {
		alert(`Contacter le prestataire : ${service.title}`);
	}

	/**
	 * @param {{ id?: number; category?: string; title: any; price?: number; description: any; image?: string; }} service
	 */
	function handleDetails(service) {
		alert(`Détails du service : ${service.title}\nDescription : ${service.description}`);
	}
</script>

<div class="bg-base-200 min-h-screen p-6">
	<div class="mb-6 flex flex-wrap gap-4">
		<select
			bind:value={selectedCategory}
			class="focus:border-primary w-full rounded-md border border-gray-300 p-2 focus:outline-none md:w-80"
		>
			<option>{$all_services}</option>
			<option>{$taxi}</option>
			<option>{$gardening}</option>
			<option>{$childcare}</option>
		</select>

		<input
			type="text"
			placeholder="Ville"
			class="focus:border-primary w-full rounded-md border border-gray-300 p-2 focus:outline-none md:w-80"
		/>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each filteredServices as service}
			<div class="card bg-base-100 rounded-lg border border-gray-200 shadow-md">
				<figure>
					<img
						src={service.image}
						alt={service.title}
						class="h-40 w-full rounded-t-lg object-cover"
					/>
				</figure>
				<div class="p-4">
					<div class="badge badge-primary">{$professional_service_provider}</div>
					<div class="font-author mt-2 text-lg">{service.price} €</div>
					<h3 class="font-author mt-2 text-lg">{service.title}</h3>
					<p class="text-sm text-gray-600">{service.description}</p>
					<div class="mt-4 flex gap-2">
						<button
							on:click={() => handleContact(service)}
							class="bg-primary flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm text-black hover:bg-gray-100"
						>
							{$contact}
						</button>
						<button
							on:click={() => handleDetails(service)}
							class="h-10 rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 transition-colors hover:bg-gray-300"
						>
							{$details}
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
