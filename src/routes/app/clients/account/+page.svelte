<script lang="ts">
	import WalletBox from '$lib/components/WalletBox.svelte';
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { fetchFromAPI } from '$lib/utils/api';
	import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
	import { onDestroy, onMount } from 'svelte';
	import { notifications } from '$lib/stores/notifications';
	import { goto } from '$app/navigation';
	import { startTour } from '$lib/stores/tour';

	onMount(() => onDestroy(tabTitle('app.clients.account.tab_title')));

	// Traductions
	const account_title = t('app.clients.account.my_account.title');
	const my_sub = t('app.clients.account.my_account.my_sub');
	const manage = t('app.clients.account.my_account.manage');
	const wallet_title = t('app.clients.account.my_electronic_wallet.title');

	// Typages
	type CurrentSubscription = {
		subscription: {
			id: number;
			name: string;
			description: string;
			price: number;
			stripe_id: string;
			created_at: string;
			updated_at: string;
		};
		end_date: string | null;
		is_active: boolean;
	};

	type Subscription = {
		id: number;
		name: string;
		description: string;
		price: number;
		stripe_id: string;
		created_at: string;
		updated_at: string;
	};

	// État local
	let currentSubscription: CurrentSubscription | null = null;
	let availableSubscriptions: Subscription[] = [];
	let isLoading = true;

	const getHeaders = () => ({
		'Content-Type': 'application/json',
		Authorization: `Bearer ${get(accessToken)}`
	});

	onMount(async () => {
		try {
			const [subscription, subscriptions] = await Promise.all([
				fetchFromAPI<CurrentSubscription>('/subscriptions/me', {
					headers: getHeaders()
				}),
				fetchFromAPI<Subscription[]>('/subscriptions', {
					headers: getHeaders()
				})
			]);

			currentSubscription = subscription;
			availableSubscriptions = subscriptions.filter(sub => sub.name !== 'Free'); // Exclure le plan Free
		} catch (err) {
			console.error('Erreur lors du chargement de l\'abonnement', err);
			notifications.error('Impossible de charger les informations d\'abonnement');
		} finally {
			isLoading = false;
		}
	});

	async function handleManageSubscription() {
		try {
			// Redirection vers la page de gestion des abonnements
			goto('/app/clients/subscription');
		} catch (err) {
			console.error('Erreur lors de la redirection', err);
			notifications.error('Impossible d\'accéder à la page de gestion');
		}
	}

	async function handleUpgradeSubscription(subscription: Subscription) {
		try {
			notifications.info("Redirection vers le checkout...");
			
			const response = await fetchFromAPI<{ url: string }>('/stripe/subscription-checkout', {
				method: 'POST',
				headers: getHeaders(),
				body: JSON.stringify({
					priceId: subscription.stripe_id,
					successUrl: `${window.location.origin}/app/clients/account?subscription=success`,
					cancelUrl: `${window.location.origin}/app/clients/account?subscription=cancel`
				})
			});

			// Redirection vers le checkout Stripe
			window.location.href = response.url;
		} catch (err) {
			console.error('Erreur lors de la redirection vers le checkout', err);
			notifications.error('Impossible d\'accéder au checkout');
		}
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return 'Non défini';
		return new Date(dateString).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getStatusText(isActive: boolean): string {
		return isActive ? 'Actif' : 'Inactif';
	}

	function getStatusColor(isActive: boolean): string {
		return isActive ? 'text-green-600' : 'text-red-600';
	}
</script>

<div class="ml-0 max-w-2xl bg-[#FEFCF3] p-6">
	<h1 class="font-author mb-6 text-2xl text-gray-800">{$account_title}</h1>

	<!-- Bloc abonnement -->
	<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
		<p class="mb-2 text-sm text-gray-600">{$my_sub}</p>

		{#if isLoading}
			<div class="flex items-center justify-center py-4">
				<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
				<span class="ml-2 text-gray-600">Chargement...</span>
			</div>
		{:else if currentSubscription}
			<div class="space-y-4">
				<!-- Abonnement actuel -->
				<div class="flex items-center justify-between">
					<div class="mr-2 flex-grow rounded-md bg-gray-100 px-4 py-2">
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-700">
									{currentSubscription.subscription.name}
									<span class="ml-2 text-sm text-gray-500">
										({currentSubscription.subscription.price}€/mois)
									</span>
								</p>
								<p class="text-xs text-gray-500 mt-1">
									{currentSubscription.subscription.description}
								</p>
							</div>
							<div class="text-right">
								<p class="text-sm {getStatusColor(currentSubscription.is_active)} font-medium">
									{getStatusText(currentSubscription.is_active)}
								</p>
								{#if currentSubscription.end_date}
									<p class="text-xs text-gray-500 mt-1">
										Jusqu'au {formatDate(currentSubscription.end_date)}
									</p>
								{/if}
							</div>
						</div>
					</div>
					<button
						on:click={handleManageSubscription}
						class="btn btn-primary btn-sm"
					>
						{$manage}
					</button>
				</div>

				<!-- Plans disponibles -->
				{#if currentSubscription.subscription.name === 'Free' && availableSubscriptions.length > 0}
					<div class="border-t pt-4">
						<p class="mb-3 text-sm font-medium text-gray-700">Plans disponibles :</p>
						<div class="space-y-2">
							{#each availableSubscriptions as subscription}
								<div class="flex items-center justify-between rounded-md border border-gray-200 p-3">
									<div>
										<p class="font-medium text-gray-700">{subscription.name}</p>
										<p class="text-xs text-gray-500">{subscription.description}</p>
										<p class="text-sm font-medium text-primary">{subscription.price}€/mois</p>
									</div>
									<button
										on:click={() => handleUpgradeSubscription(subscription)}
										class="btn btn-primary btn-sm"
									>
										Souscrire
									</button>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex items-center justify-between">
				<p class="text-gray-500 italic">Aucun abonnement actif.</p>
				<button
					on:click={handleManageSubscription}
					class="btn btn-primary btn-sm"
				>
					{$manage}
				</button>
			</div>

			<!-- Lien vers la page des abonnements -->
			<div class="mt-4 text-center">
				<button
					on:click={() => goto('/app/clients/subscription')}
					class="btn btn-link btn-sm"
				>
					Voir tous les plans d'abonnement
				</button>
			</div>
		{/if}
	</div>

	<!-- Bloc Wallet -->
	<WalletBox profileType="clients" />

	<!-- Bloc Actions -->
	<div class="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
		<h2 class="text-lg font-medium text-gray-800">Actions</h2>
		<div class="mt-4">
			<button class="btn btn-outline" on:click={startTour}>
				Revoir le tutoriel de bienvenue
			</button>
		</div>
	</div>
</div>
