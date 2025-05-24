<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
	import { fetchFromAPI } from '$lib/utils/api';
	import { notifications } from '$lib/stores/notifications';
	import { profileIds } from '$lib/stores/profiles';
	import dayjs from 'dayjs';
	import 'dayjs/locale/fr';
	dayjs.locale('fr');

	type Route = {
		id: number;
		departure_location: number;
		arrival_location: number;
		day: string;
	};

	type Location = {
		id: number;
		name: string;
	};

	let routes: Route[] = [];
	let locations: Location[] = [];
	let departure_location = 0;
	let arrival_location = 0;
	let day = '';
	let isSubmitting = false;

	const getHeaders = () => ({
		'Content-Type': 'application/json',
		Authorization: `Bearer ${get(accessToken)}`
	});

	onMount(async () => {
		await Promise.all([loadLocations(), loadRoutes()]);
	});

	async function loadLocations() {
		try {
			locations = await fetchFromAPI<Location[]>('/locations', { headers: getHeaders() });
		} catch {
			notifications.error('Impossible de charger les lieux.');
		}
	}

	async function loadRoutes() {
		try {
			const profile = get(profileIds);
			routes = await fetchFromAPI<Route[]>(
				`/routes?delivery_person_id=${profile.deliveryPersonId}`,
				{
					headers: getHeaders()
				}
			);
		} catch {
			notifications.error('Impossible de charger vos trajets.');
		}
	}

	async function addRoute() {
		if (!departure_location || !arrival_location || !day) {
			notifications.warning('Veuillez remplir tous les champs.');
			return;
		}

		if (departure_location === arrival_location) {
			notifications.warning('Le lieu de départ et d’arrivée doivent être différents.');
			return;
		}

		const exists = routes.some(
			(r) =>
				r.departure_location === departure_location &&
				r.arrival_location === arrival_location &&
				dayjs(r.day).isSame(day, 'day')
		);

		if (exists) {
			notifications.warning('Ce trajet a déjà été enregistré.');
			return;
		}

		isSubmitting = true;

		try {
			await fetchFromAPI('/routes', {
				method: 'POST',
				headers: getHeaders(),
				body: JSON.stringify({
					delivery_person_id: get(profileIds).deliveryPersonId,
					departure_location,
					arrival_location,
					day
				})
			});
			notifications.success('Trajet ajouté avec succès.');
			departure_location = 0;
			arrival_location = 0;
			day = '';
			await loadRoutes();
		} catch {
			notifications.error('Erreur lors de l’ajout du trajet.');
		} finally {
			isSubmitting = false;
		}
	}

	async function deleteRoute(id: number) {
		try {
			await fetchFromAPI(`/routes/${id}`, {
				method: 'DELETE',
				headers: getHeaders()
			});
			routes = routes.filter((r) => r.id !== id);
			notifications.success('Trajet supprimé.');
		} catch {
			notifications.error('Erreur lors de la suppression du trajet.');
		}
	}

	function formatLocation(id: number) {
		return locations.find((l) => l.id === id)?.name || '—';
	}
</script>

<div class="mx-auto min-h-screen max-w-3xl bg-[#FEFCF3] p-6">
	<h1 class="font-author mb-6 text-2xl text-gray-800">Mes trajets</h1>

	<p class="mb-6 text-sm text-gray-600">
		Vous recevrez une notification lorsqu'une mission correspond à l’un de vos trajets ce jour-là.
	</p>

	<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
		<h2 class="mb-4 text-lg font-bold">Ajouter un trajet</h2>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<select class="select select-bordered w-full" bind:value={departure_location}>
				<option value="0" disabled selected>Lieu de départ</option>
				{#each locations as loc}
					<option value={loc.id}>{loc.name}</option>
				{/each}
			</select>

			<select class="select select-bordered w-full" bind:value={arrival_location}>
				<option value="0" disabled selected>Lieu d’arrivée</option>
				{#each locations as loc}
					<option value={loc.id}>{loc.name}</option>
				{/each}
			</select>

			<input
				type="date"
				class="input input-bordered w-full"
				bind:value={day}
				min={new Date().toISOString().split('T')[0]}
			/>
		</div>

		<div class="mt-4 flex justify-end">
			<button class="btn btn-primary" on:click={addRoute} disabled={isSubmitting}>
				Ajouter le trajet
			</button>
		</div>
	</div>

	{#if routes.length > 0}
		<div class="grid grid-cols-1 gap-4">
			{#each routes as route}
				<div
					class="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4 shadow-sm"
				>
					<div>
						<p class="text-sm font-medium text-gray-700">
							{formatLocation(route.departure_location)} → {formatLocation(route.arrival_location)}
						</p>
						<p class="mt-1 text-xs text-gray-500">
							Date : {dayjs(route.day).format('dddd D MMMM YYYY')}
						</p>
					</div>
					<button class="btn btn-sm btn-error" on:click={() => deleteRoute(route.id)}
						>Supprimer</button
					>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-sm text-gray-600">Aucun trajet enregistré pour le moment.</p>
	{/if}
</div>
