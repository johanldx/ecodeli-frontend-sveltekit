<script lang="ts">
	import { accessToken } from '$lib/stores/token';
	import { profileIds } from '$lib/stores/profiles';
	import { fetchFromAPI } from '$lib/utils/api';
	import { t } from '$lib/utils/t';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	type TraderStatsResponse = {
		totalPaid: number;
		totalEarned: number;
		reductionAmount: number;
	};

	let stats: TraderStatsResponse | null = null;
	let loading = true;

	const stats_title = t('app.traders.account.monthly_stats.title');
	const total_paid = t('app.traders.account.monthly_stats.total_paid');
	const total_earned = t('app.traders.account.monthly_stats.total_earned');
	const reduction_amount = t('app.traders.account.monthly_stats.reduction_amount');

	const getHeaders = () => ({
		'Content-Type': 'application/json',
		Authorization: `Bearer ${get(accessToken)}`
	});

	onMount(async () => {
		try {
			const profiles = get(profileIds);
			if (profiles && profiles.traderId) {
				stats = await fetchFromAPI<TraderStatsResponse>(`/traders/${profiles.traderId}/monthly-stats`, {
					headers: getHeaders()
				});
			}
		} catch (error) {
			console.error('Erreur lors du chargement des statistiques:', error);
		} finally {
			loading = false;
		}
	});
</script>

<h2 class="font-author mb-4 text-xl text-gray-800">{$stats_title}</h2>

<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
	{#if loading}
		<div class="text-center">
			<span class="loading loading-spinner"></span>
		</div>
	{:else if stats}
		<div class="mb-6 flex justify-center gap-8">
			<div class="text-center">
				<p class="font-author text-2xl text-gray-800 line-through opacity-60">{stats.totalPaid.toFixed(2)} €</p>
				<p class="font-author text-2xl text-green-600">{stats.totalEarned.toFixed(2)} €</p>
				<p class="text-sm text-gray-600">{$total_earned}</p>
			</div>
		</div>
		
		{#if stats.reductionAmount > 0}
			<div class="text-center">
				<p class="font-author text-lg text-blue-600">+{stats.reductionAmount.toFixed(2)} €</p>
				<p class="text-sm text-gray-600">{$reduction_amount}</p>
			</div>
		{/if}
	{:else}
		<div class="text-center text-gray-500">
			<p>Aucune donnée disponible</p>
		</div>
	{/if}
</div> 