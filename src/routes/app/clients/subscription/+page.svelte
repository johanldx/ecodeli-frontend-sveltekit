<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { fetchFromAPI } from '$lib/utils/api';
	import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
	import { onDestroy, onMount } from 'svelte';
	import { notifications } from '$lib/stores/notifications';
	import { goto } from '$app/navigation';

	onMount(() => onDestroy(tabTitle('app.clients.subscription.tab_title')));

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
	let isChanging = false; // Pour désactiver les boutons pendant une action

	const getHeaders = () => ({
		'Content-Type': 'application/json',
		Authorization: `Bearer ${get(accessToken)}`
	});

	async function loadData() {
		isLoading = true;
		try {
			const [subscriptionResponse, subscriptions] = await Promise.all([
				fetchFromAPI<CurrentSubscription>('/subscriptions/me', {
					headers: getHeaders()
				}).catch(() => null), // Retourne null si pas d'abonnement
				fetchFromAPI<Subscription[]>('/subscriptions', {
					headers: getHeaders()
				})
			]);

			currentSubscription = subscriptionResponse;
			availableSubscriptions = subscriptions;
		} catch (err) {
			console.error("Erreur lors du chargement de l'abonnement", err);
			notifications.error("Impossible de charger les informations d'abonnement");
		} finally {
			isLoading = false;
		}
	}

	onMount(async () => {
		await loadData();
	});

	async function handleSubscriptionChange(newSubscription: Subscription) {
		if (isChanging) return;
		isChanging = true;

		try {
			// Si l'utilisateur a déjà un abonnement PAYANT, on le modifie directement
			if (currentSubscription && currentSubscription.subscription.name !== 'Free') {
				notifications.info('Mise à jour de votre abonnement...');
				await fetchFromAPI('/stripe/change-subscription', {
					method: 'POST',
					headers: getHeaders(),
					body: JSON.stringify({
						priceId: newSubscription.stripe_id
					})
				});
				notifications.success('Votre abonnement a été mis à jour avec succès !');
				await loadData(); // Recharger les données pour voir le nouvel état
			} else {
				// Sinon (nouvel abonnement ou depuis le plan Free), on passe par le checkout
				notifications.info('Redirection vers le checkout...');
				const response = await fetchFromAPI<{ url: string }>('/stripe/subscription-checkout', {
					method: 'POST',
					headers: getHeaders(),
					body: JSON.stringify({
						priceId: newSubscription.stripe_id,
						successUrl: `${window.location.origin}/app/clients/subscription?subscription=success`,
						cancelUrl: `${window.location.origin}/app/clients/subscription?subscription=cancel`
					})
				});
				window.location.href = response.url;
			}
		} catch (err) {
			console.error('Erreur lors du changement d\'abonnement', err);
			const message =
				err instanceof Error ? err.message : "Impossible de modifier l'abonnement";
			notifications.error(message);
		} finally {
			isChanging = false;
		}
	}

	async function handleManageSubscription() {
		try {
			notifications.info("Redirection vers le portail de gestion...");
			
			const returnUrl = encodeURIComponent(window.location.href);
			const response = await fetchFromAPI<{ url: string }>(`/subscriptions/portal?return_url=${returnUrl}`, {
				headers: getHeaders()
			});

			// Redirection vers le portail Stripe
			window.location.href = response.url;
		} catch (err) {
			console.error('Erreur lors de la redirection vers le portail', err);
			notifications.error('Impossible d\'accéder au portail de gestion');
		}
	}

	async function handleDowngradeToFree() {
		try {
			notifications.info("Redirection vers le portail de gestion...");
			
			const returnUrl = encodeURIComponent(window.location.href);
			const response = await fetchFromAPI<{ url: string }>(`/subscriptions/portal?return_url=${returnUrl}`, {
				headers: getHeaders()
			});

			// Redirection vers le portail Stripe pour annuler l'abonnement
			window.location.href = response.url;
		} catch (err) {
			console.error('Erreur lors de la redirection vers le portail', err);
			notifications.error('Impossible d\'accéder au portail de gestion');
		}
	}

	function getPlanFeatures(planName: string): string[] {
		switch (planName) {
			case 'Free':
				return [
					'Accès aux fonctionnalités de base',
					'Création d\'annonces limitées',
					'Support communautaire'
				];
			case 'Starter':
				return [
					'Tout du plan Free',
					'Annonces illimitées',
					'Support prioritaire',
					'Statistiques avancées',
					'Notifications push'
				];
			case 'Premium':
				return [
					'Tout du plan Starter',
					'Fonctionnalités premium',
					'Support dédié',
					'Analytics avancés',
					'API personnalisée',
					'Accès anticipé aux nouvelles fonctionnalités'
				];
			default:
				return [];
		}
	}

	function isCurrentPlan(planName: string): boolean {
		return currentSubscription?.subscription.name === planName;
	}

	function canUpgrade(planName: string): boolean {
		if (!currentSubscription) return true;
		
		const planOrder = ['Free', 'Starter', 'Premium'];
		const currentIndex = planOrder.indexOf(currentSubscription.subscription.name);
		const targetIndex = planOrder.indexOf(planName);
		
		return targetIndex > currentIndex;
	}

	function canDowngrade(planName: string): boolean {
		if (!currentSubscription) return false;
		
		const planOrder = ['Free', 'Starter', 'Premium'];
		const currentIndex = planOrder.indexOf(currentSubscription.subscription.name);
		const targetIndex = planOrder.indexOf(planName);
		
		return targetIndex < currentIndex;
	}
</script>

<div class="min-h-screen bg-[#FEFCF3] p-6">
	<div class="mx-auto max-w-6xl">
		<!-- Header -->
		<div class="mb-8">
			<button 
				on:click={() => goto('/app/clients/account')}
				class="mb-4 flex items-center text-gray-600 hover:text-gray-800"
			>
				<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
				</svg>
				Retour au compte
			</button>
			<h1 class="font-author text-3xl font-bold text-gray-800">Plans d'abonnement</h1>
			<p class="mt-2 text-gray-600">Choisissez le plan qui vous convient le mieux</p>
		</div>

		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				<span class="ml-3 text-gray-600">Chargement des plans...</span>
			</div>
		{:else}
			<!-- Plans d'abonnement -->
			<div class="grid gap-8 md:grid-cols-3">
				{#each availableSubscriptions as subscription}
					<div
						class="relative rounded-lg border-2 p-6 shadow-lg transition-all hover:shadow-xl {isCurrentPlan(
							subscription.name
						)
							? 'border-primary bg-primary/5'
							: 'border-gray-200 bg-white'}"
					>
						<!-- Badge plan actuel -->
						{#if isCurrentPlan(subscription.name)}
							<div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
								<span class="bg-primary text-primary-content rounded-full px-4 py-1 text-sm font-medium">
									Plan actuel
								</span>
							</div>
						{/if}

						<!-- Header du plan -->
						<div class="text-center">
							<h3 class="text-xl font-bold text-gray-800">{subscription.name}</h3>
							<div class="mt-2">
								<span class="text-3xl font-bold text-primary">
									{subscription.price === 0 ? 'Gratuit' : `${subscription.price}€`}
								</span>
								{#if subscription.price > 0}
									<span class="text-gray-500">/mois</span>
								{/if}
							</div>
							<p class="mt-2 text-sm text-gray-600">{subscription.description}</p>
						</div>

						<!-- Fonctionnalités -->
						<div class="mt-6">
							<h4 class="font-medium text-gray-800 mb-3">Fonctionnalités incluses :</h4>
							<ul class="space-y-2">
								{#each getPlanFeatures(subscription.name) as feature}
									<li class="flex items-center text-sm text-gray-600">
										<svg class="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
										</svg>
										{feature}
									</li>
								{/each}
							</ul>
						</div>

						<!-- Actions -->
						<div class="mt-6">
							{#if isCurrentPlan(subscription.name)}
								<button on:click={handleManageSubscription} class="btn btn-secondary btn-block">
									Gérer l'abonnement
								</button>
							{:else if subscription.name === 'Free' && canDowngrade(subscription.name)}
								<button
									on:click={handleDowngradeToFree}
									disabled={isChanging}
									class="btn btn-warning btn-block"
								>
									Rétrograder vers Free
								</button>
							{:else if canUpgrade(subscription.name)}
								<button
									on:click={() => handleSubscriptionChange(subscription)}
									disabled={isChanging}
									class="btn btn-primary btn-block"
								>
									{#if isChanging}
										<span class="loading loading-spinner"></span>
									{/if}
									Passer à {subscription.name}
								</button>
							{:else if canDowngrade(subscription.name) && subscription.name !== 'Free'}
								<button
									on:click={() => handleSubscriptionChange(subscription)}
									disabled={isChanging}
									class="btn btn-warning btn-block"
								>
									{#if isChanging}
										<span class="loading loading-spinner"></span>
									{/if}
									Rétrograder vers {subscription.name}
								</button>
							{:else}
								<button disabled class="btn btn-disabled btn-block"> Action non disponible </button>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- Informations supplémentaires -->
			<div class="mt-12 rounded-lg bg-gray-50 p-6">
				<h3 class="font-medium text-gray-800 mb-3">Informations importantes :</h3>
				<ul class="space-y-2 text-sm text-gray-600">
					<li>• Les changements de plan prennent effet immédiatement</li>
					<li>• Les rétrogradations sont proratisées</li>
					<li>• Vous pouvez annuler votre abonnement à tout moment</li>
					<li>• Support disponible 24/7 pour les plans payants</li>
				</ul>
			</div>
		{/if}
	</div>
</div> 