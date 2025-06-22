<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';
	import { fetchFromAPI } from '$lib/utils/api';
	import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
	import { profileIds } from '$lib/stores/profiles';

	onMount(() => onDestroy(tabTitle('app.traders.account.tab_title')));

	const title = t('app.traders.account.title');
	const manage_my_documents = t('app.traders.account.manage_my_documents');
	const manage_global_account = t('app.traders.account.manage_global_account');
	const manage_my_addresses = t('app.traders.account.manage_my_addresses');
	const samples_title = t('app.traders.samples.title');
	const amount_billed_month = t('app.traders.samples.amount_billed_month');
	const manage_samples = t('app.traders.samples.manage_samples');
	const pricing_title = t('app.traders.pricing.title');
	const customer_service = t('app.traders.pricing.title');
	const customer_contact = t('app.traders.pricing.customer_contact');
	const invoice_title = t('app.traders.invoice.title');
	const reduction_title = t('app.traders.account.reduction_title');
	const standard_rate = t('app.traders.account.standard_rate');
	const reduction_rate = t('app.traders.account.reduction_rate');

	let traderData: any = null;
	let loading = true;

	onMount(async () => {
		try {
			const profiles = get(profileIds);
			if (profiles && profiles.traderId) {
				traderData = await fetchFromAPI(`/traders/${profiles.traderId}`, {
					headers: { Authorization: `Bearer ${get(accessToken)}` }
				});
			}
		} catch (error) {
			console.error('Erreur lors du chargement des données du trader:', error);
		} finally {
			loading = false;
		}
	});

	function handleManageDocuments() {
		alert('Redirection vers la gestion des pièces justificatives...');
	}

	function handleManageAccount() {
		alert('Redirection vers la gestion du compte global...');
	}

	function handleManageAddresses() {
		alert('Redirection vers la gestion des adresses...');
	}

	function handleManageSEPA() {
		alert('Redirection vers la gestion des prélèvements SEPA...');
	}

	function handleContactSupport() {
		alert('Redirection vers le service client...');
	}

	function handleViewInvoice(month: string) {
		alert(`Visualisation de la facture ${month}...`);
	}
</script>

<div class="bg-[#FEFCF3] p-6">
	<div class="mx-auto h-screen">
		<h1 class="font-author mb-6 text-2xl text-gray-800">{$title}</h1>

		<!-- Encadré de contact support -->
		<div class="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-6 shadow-md">
			<div class="flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
				<div>
					<h3 class="font-author text-lg text-orange-800">Modification des pièces justificatives</h3>
					<p class="text-sm text-orange-700">Pour modifier vos pièces justificatives, veuillez contacter le support Ecodeli. Notre équipe vous accompagnera dans cette démarche.</p>
				</div>
			</div>
		</div>

		<div class="mt-6 lg:mt-0 lg:w-1/3">
			<h2 class="font-author mb-4 text-xl text-gray-800">{$reduction_title}</h2>
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
				{#if loading}
					<div class="text-center">
						<span class="loading loading-spinner"></span>
					</div>
				{:else if traderData}
					{#if traderData.reduction_percent > 0}
						<h2 class="font-author mb-2 text-xl text-green-600">{$pricing_title} -{traderData.reduction_percent}%</h2>
						<p class="mb-4 text-sm text-gray-600">{$reduction_rate.replace('{percent}', traderData.reduction_percent.toString())}</p>
					{:else}
						<h2 class="font-author mb-2 text-xl text-gray-600">{$pricing_title}</h2>
						<p class="mb-4 text-sm text-gray-600">{$standard_rate}</p>
					{/if}
				{:else}
					<h2 class="font-author mb-2 text-xl text-gray-600">{$pricing_title}</h2>
					<p class="mb-4 text-sm text-gray-600">{$standard_rate}</p>
				{/if}

				<button
					on:click={handleContactSupport}
					class="bg-neutral w-full rounded-md px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
				>
					{$customer_contact}
				</button>
			</div>
		</div>

		<div class="flex flex-col lg:flex-row lg:gap-6 mt-5">
			<div class="lg:w-2/3">
				<h2 class="font-author mb-4 text-xl text-gray-800">{$samples_title}</h2>
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
					<div class="mb-6 flex flex-col items-center">
						<p class="font-author text-2xl text-gray-800">49,75 €</p>
						<p class="text-sm text-gray-600">{$amount_billed_month}</p>
					</div>

					<button
						on:click={handleManageSEPA}
						class="bg-primary text-primary-content w-full rounded-md py-2 text-sm transition-colors hover:bg-emerald-500"
					>
						{$manage_samples}
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
