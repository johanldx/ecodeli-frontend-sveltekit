<script lang="ts">
	import { notifications } from '$lib/stores/notifications';
	import { profileIds } from '$lib/stores/profiles';
	import { accessToken } from '$lib/stores/token';
	import { user } from '$lib/stores/user';
	import { fetchFromAPI } from '$lib/utils/api';
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import WalletBox from '$lib/components/WalletBox.svelte';

	let serviceTypes: ServiceType[] = [];
	let authorizedTypeIds: number[] = [];
	let authorizedServicesWithPrices: { id: number; name: string; price: number }[] = [];
	let ratingStats: {
		averageRating: number;
		totalRatings: number;
		ratingDistribution: { [key: number]: number };
	} | null = null;

	let invoices: any[] = [];
	let loading = true;
	let providerId: number | null = null;

	$: {
		if ($profileIds?.providerId && $profileIds.providerId !== providerId) {
			providerId = $profileIds.providerId;
			loadInvoices(providerId);
		}
	}

	type ServiceType = {
		id: number;
		name: string;
	};

	type Authorization = {
		personalServiceTypeId: number;
		price: number;
	};

	const account_title = t('app.providers.account.title');
	const customer_service = t('app.providers.service.customer_service');

	function getHeaders() {
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${get(accessToken)}`
		};
	}

	async function loadServiceTypes() {
		try {
			const all = await fetchFromAPI<ServiceType[]>('/personal-service-types', {
				headers: getHeaders()
			});
			serviceTypes = all;

			const auths = await fetchFromAPI<Authorization[]>(
				`/personal-service-type-authorizations?providerId=${get(profileIds).providerId}`,
				{ headers: getHeaders() }
			);
			authorizedTypeIds = auths.map((a) => a.personalServiceTypeId);
			
			// Créer une liste des services autorisés avec leurs prix
			authorizedServicesWithPrices = auths.map(auth => {
				const serviceType = serviceTypes.find(st => st.id === auth.personalServiceTypeId);
				return {
					id: auth.personalServiceTypeId,
					name: serviceType?.name || 'Service inconnu',
					price: auth.price
				};
			});
		} catch {
			notifications.error('Erreur lors du chargement des types de prestations');
		}
	}

	async function loadRatingStats() {
		try {
			const currentUser = get(user);
			if (!currentUser) {
				notifications.error('Utilisateur non connecté');
				return;
			}
			
			ratingStats = await fetchFromAPI(`/ratings/provider/${currentUser.id}/stats`, {
				headers: getHeaders()
			});
		} catch {
			notifications.error('Erreur lors du chargement des statistiques de notation');
		}
	}

	async function loadInvoices(id: number) {
		loading = true;
		try {
			const res = await fetchFromAPI(`/invoices/provider/${id}`, {
				headers: { Authorization: `Bearer ${get(accessToken)}` }
			});
			invoices = res as any[];
		} catch (e) {
			notifications.error("Erreur lors du chargement des factures.");
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadServiceTypes();
		loadRatingStats();
		onDestroy(tabTitle('app.providers.account.tab_title'));
	});

	function handleViewInvoice(invoice: { documentUrl: string }) {
		window.open(invoice.documentUrl, '_blank');
	}

	function handleManageProfil() {
		alert('Redirection vers la gestion du profil...');
	}

	function handleValidateIBAN() {
		alert("Validation de l'IBAN...");
	}

	function formatMonthYear(dateStr: string) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
	}
</script>

<div class="bg-base-200 mx-auto p-6">
	<div class="mx-auto">
		<h1 class="font-author mb-6 text-2xl text-gray-800">{$account_title}</h1>

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
			<h2 class="font-author my-4 text-xl text-gray-800">Services accrédités</h2>
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
				<div class="space-y-1">
					{#each serviceTypes as service}
						{@const isAuthorized = authorizedTypeIds.includes(service.id)}
						{@const authorizedService = authorizedServicesWithPrices.find(s => s.id === service.id)}
						<div
							class={isAuthorized ? '' : ' text-gray-500 line-through'}
						>
							<p class="text-sm">
								{service.name}
								{#if isAuthorized && authorizedService}
									<span class="text-green-600 font-medium">({authorizedService.price}€)</span>
								{/if}
							</p>
						</div>
					{/each}
					<a href="mailto:hello@ecodeli.fr" class="btn btn-neutral mt-2 w-full"
						>{$customer_service}</a
					>
				</div>
			</div>
		</div>

		<!-- Carte des statistiques de rating -->
		<div class="mt-6 lg:mt-0 lg:w-1/3">
			<h2 class="font-author my-4 text-xl text-gray-800">Avis clients</h2>
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
				{#if ratingStats && ratingStats.totalRatings > 0}
					<div class="text-center mb-4">
						<div class="flex justify-center items-center gap-2 mb-2">
							<span class="text-3xl font-bold text-yellow-500">{ratingStats.averageRating}</span>
							<div class="flex gap-1">
								{#each Array(5) as _, i}
									{@const starNumber = i + 1}
									<span class="text-xl {starNumber <= Math.round(ratingStats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}">★</span>
								{/each}
							</div>
						</div>
						<p class="text-sm text-gray-600">{ratingStats.totalRatings} avis</p>
					</div>

					<!-- Distribution des notes -->
					<div class="space-y-2">
						{#each [5, 4, 3, 2, 1] as rating}
							{@const count = ratingStats.ratingDistribution[rating] || 0}
							{@const percentage = ratingStats.totalRatings > 0 ? (count / ratingStats.totalRatings) * 100 : 0}
							<div class="flex items-center gap-2">
								<span class="text-sm w-4">{rating}★</span>
								<div class="flex-1 bg-gray-200 rounded-full h-2">
									<div class="bg-yellow-400 h-2 rounded-full" style="width: {percentage}%"></div>
								</div>
								<span class="text-xs text-gray-500 w-8">{count}</span>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8">
						<div class="text-gray-400 text-4xl mb-2">⭐</div>
						<p class="text-gray-500 text-sm">Aucun avis pour le moment</p>
					</div>
				{/if}
			</div>
		</div>

		<div class="mt-5 lg:w-2/3">
			<WalletBox profileType="providers" />
		</div>

		<div class="mt-6 lg:mt-0 lg:w-1/3">
			<h2 class="font-author my-4 text-xl text-gray-800">Factures</h2>
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
				{#if loading}
					<div>Chargement…</div>
				{:else if invoices.length === 0}
					<div class="text-gray-500">Aucune facture disponible.</div>
				{:else}
					<div class="space-y-3">
						{#each invoices as invoice}
							<button
								on:click={() => handleViewInvoice(invoice)}
								class="flex w-full items-center justify-between rounded-md p-3 text-left transition-colors hover:bg-gray-50"
							>
								<span>{formatMonthYear(invoice.createdAt)}</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 text-gray-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
