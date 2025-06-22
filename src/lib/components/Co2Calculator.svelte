<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchFromAPI } from '$lib/utils/api';
	import { accessToken } from '$lib/stores/token';
	import { get } from 'svelte/store';
	import { notifications } from '$lib/stores/notifications';

	let isOpen = false;
	let userAddresses: any[] = [];
	let fromAddressId: number | null = null;
	let toAddressId: number | null = null;
	let result: { distance: number; co2Saved: number; co2SavedPerKm: number } | null = null;
	let isLoading = false;
	let isLoadingAddresses = true;

	onMount(async () => {
		try {
			userAddresses = await fetchFromAPI('/locations', {
				headers: { Authorization: `Bearer ${get(accessToken)}` }
			});
		} catch (error) {
			console.error("Impossible de charger les adresses de l'utilisateur.", error);
		} finally {
			isLoadingAddresses = false;
		}
	});

	/**
	 * Convertit les grammes en kg si la valeur est supérieure à 1000g
	 */
	function formatCo2(grams: number): string {
		if (grams >= 1000) {
			return `${(grams / 1000).toFixed(2)} kg`;
		}
		return `${grams.toFixed(2)} g`;
	}

	async function calculate() {
		if (!fromAddressId || !toAddressId) {
			notifications.error('Veuillez sélectionner une adresse de départ et une adresse d\'arrivée.');
			return;
		}
		if (fromAddressId === toAddressId) {
			notifications.error('Les adresses de départ et d\'arrivée doivent être différentes.');
			return;
		}

		isLoading = true;
		result = null;

		const fromAddress = userAddresses.find((a) => a.id === fromAddressId);
		const toAddress = userAddresses.find((a) => a.id === toAddressId);

		console.log('From address ID:', fromAddressId);
		console.log('To address ID:', toAddressId);

		try {
			// Délai artificiel pour le loader
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			const response = await fetchFromAPI(`/co2-calculator/calculate?fromId=${fromAddressId}&toId=${toAddressId}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${get(accessToken)}`
				}
			});
			result = response as { distance: number; co2Saved: number; co2SavedPerKm: number };
		} catch (error: any) {
			notifications.error(error.message || 'Une erreur est survenue lors du calcul.');
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="fixed bottom-4 right-4 z-50">
	{#if isOpen}
		<div class="card w-96 bg-base-100 shadow-xl">
			<div class="card-body">
				<div class="flex justify-between items-center">
					<h2 class="card-title">Calculateur d'économies CO₂</h2>
					<button class="btn btn-sm btn-circle btn-ghost" on:click={() => (isOpen = false)}>✕</button>
				</div>
				<p class="text-sm">Calculez combien de CO₂ vous économisez en utilisant EcoDeli !</p>

				{#if isLoadingAddresses}
					<div class="text-center p-4"><span class="loading loading-dots"></span></div>
				{:else}
					<div class="form-control">
						<label class="label" for="fromAddress"><span class="label-text">Adresse de départ</span></label>
						<select id="fromAddress" class="select select-bordered" bind:value={fromAddressId}>
							<option disabled selected value={null}>Choisir une adresse</option>
							{#each userAddresses as address}
								<option value={address.id}>{address.name} - {address.city}</option>
							{/each}
						</select>
					</div>

					<div class="form-control">
						<label class="label" for="toAddress"><span class="label-text">Adresse d'arrivée</span></label>
						<select id="toAddress" class="select select-bordered" bind:value={toAddressId}>
							<option disabled selected value={null}>Choisir une adresse</option>
							{#each userAddresses as address}
								<option value={address.id}>{address.name} - {address.city}</option>
							{/each}
						</select>
					</div>
				{/if}

				<div class="card-actions justify-end mt-4">
					<button class="btn btn-primary" on:click={calculate} disabled={isLoading}>
						{#if isLoading}
							<span class="loading loading-spinner"></span>
							Calcul de votre bonne action en cours...
						{:else}
							Calculer
						{/if}
					</button>
				</div>

				{#if result}
					<div class="space-y-3 mt-4">
						<div class="card bg-base-content text-success-content">
							<div class="card-body p-4">
								<h3 class="card-title text-lg">🌱 Économies réalisées</h3>
								<div class="grid grid-cols-2 gap-4 mt-2">
									<div class="text-center">
										<div class="text-2xl font-bold">{formatCo2(result.co2SavedPerKm)}/km</div>
										<div class="text-sm opacity-80">Par kilomètre</div>
									</div>
									<div class="text-center">
										<div class="text-2xl font-bold">{formatCo2(result.co2Saved)}</div>
										<div class="text-sm opacity-80">Total du trajet</div>
									</div>
								</div>
							</div>
						</div>
						
						<div class="text-center text-sm opacity-70">
							Trajet de <strong>{result.distance} km</strong> • Merci pour la planète ! 🌍
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	{#if !isOpen}
		<button class="btn btn-primary btn-circle btn-lg shadow-lg" style="position: fixed; bottom: 1rem; right: 1rem; z-index: 50;" on:click={() => (isOpen = !isOpen)} aria-label="Ouvrir le calculateur d'économies CO₂">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="m20.893 13.393-1.135-1.135a2.252 2.252 0 0 1-.421-.585l-1.08-2.16a.414.414 0 0 0-.663-.107.827.827 0 0 1-.812.21l-1.273-.363a.89.89 0 0 0-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 0 1-1.81 1.025 1.055 1.055 0 0 1-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 0 1-1.383-2.46l.007-.042a2.25 2.25 0 0 1 .29-.787l.09-.15a2.25 2.25 0 0 1 2.37-1.048l1.178.236a1.125 1.125 0 0 0 1.302-.795l.208-.73a1.125 1.125 0 0 0-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 0 1-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 0 1-1.458-1.137l1.411-2.353a2.25 2.25 0 0 0 .286-.76m11.928 9.869A9 9 0 0 0 8.965 3.525m11.928 9.868A9 9 0 1 1 8.965 3.525" />
			  </svg>			  
		</button>
	{/if}
</div> 