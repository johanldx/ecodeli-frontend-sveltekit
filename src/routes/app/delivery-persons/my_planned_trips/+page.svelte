<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	const title = t('app.delivery.my_planned_trips.title');
	const departure = t('app.delivery.my_planned_trips.departure');
	const arrival = t('app.delivery.my_planned_trips.arrival');
	const date = t('app.delivery.my_planned_trips.date');
	const modify = t('app.delivery.my_planned_trips.modify');
	const cancel = t('app.delivery.my_planned_trips.cancel');

	import { onDestroy, onMount } from 'svelte';

	onMount(() => onDestroy(tabTitle('app.delivery.my_planned_trips')));

	// Définition de l'interface pour un trajet
	interface Trajet {
		id: number;
		villeDepart: string;
		villeArrivee: string;
		jour: string;
	}

	// Données des trajets
	let trajets: Trajet[] = [
		{
			id: 1,
			villeDepart: 'Paris',
			villeArrivee: 'Lille',
			jour: '21/04/2025'
		},
		{
			id: 2,
			villeDepart: 'Lille',
			villeArrivee: 'Paris',
			jour: '23/04/2025'
		}
	];

	// Fonctions de gestion des événements
	function handleModifier(id: number): void {
		alert(`Modifier trajet ID: ${id}`);
	}

	function handleSupprimer(id: number): void {
		alert(`Supprimer trajet ID: ${id}`);
	}
</script>

<div class="min-h-screen bg-[#FEFCF3] p-6">
	<h1 class="font-author mb-6 text-2xl text-gray-800">{$title}</h1>

	<div class="flex flex-wrap gap-6">
		{#each trajets as trajet (trajet.id)}
			<div class="w-96 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
				<div class="space-y-4">
					<div>
						<label class="font-author block text-gray-700">{$departure}</label>
						<input
							type="text"
							bind:value={trajet.villeDepart}
							class="input input-bordered focus:ring-primary/50 focus:border-primary w-full rounded-md border border-gray-300 bg-gray-100 p-2 focus:ring focus:outline-none"
						/>
					</div>

					<div>
						<label class="font-author block text-gray-700">{$arrival}</label>
						<input
							type="text"
							bind:value={trajet.villeArrivee}
							class="input input-bordered focus:ring-primary/50 focus:border-primary w-full rounded-md border border-gray-300 bg-gray-100 p-2 focus:ring focus:outline-none"
						/>
					</div>

					<div>
						<label class="font-author block text-gray-700">{$date}</label>
						<input
							type="text"
							bind:value={trajet.jour}
							class="input input-bordered focus:ring-primary/50 focus:border-primary w-full rounded-md border border-gray-300 bg-gray-100 p-2 focus:ring focus:outline-none"
						/>
					</div>

					<div class="mt-4 flex gap-4">
						<button
							on:click={() => handleModifier(trajet.id)}
							class="bg-primary text-primary-content hover:bg-opacity-90 rounded-md px-4 py-2 text-sm transition-colors"
						>
							{$modify}
						</button>

						<button
							on:click={() => handleSupprimer(trajet.id)}
							class="bg-error text-error-content hover:bg-opacity-90 rounded-md px-4 py-2 text-sm transition-colors"
						>
							{$cancel}
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
