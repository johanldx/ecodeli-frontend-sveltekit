<script lang="ts">
	import WalletBox from '$lib/components/WalletBox.svelte';
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { fetchFromAPI } from '$lib/utils/api';
	import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
	import { onDestroy, onMount } from 'svelte';
	import { notifications } from '$lib/stores/notifications';

	onMount(() => onDestroy(tabTitle('app.clients.account')));

	// Traductions
	const account_title = t('app.clients.account.my_account.title');
	const my_sub = t('app.clients.account.my_account.my_sub');
	const manage = t('app.clients.account.my_account.manage');
	const wallet_title = t('app.clients.account.my_electronic_wallet.title');

	// Typages
	type Subscription = {
		id: number;
		name: string;
		price: number;
	};

	type SubscriptionPayment = {
		id: number;
		amount: number;
		status: 'pending' | 'completed' | 'failed';
		createdAt: string;
		subscriptionId: number;
	};

	// État local
	let subscriptions: Subscription[] = [];
	let myPayments: SubscriptionPayment[] = [];
	let latestSub: SubscriptionPayment | null = null;
	let subscriptionStatus = 'none'; // 'active' | 'expired' | 'none'
	let subscriptionName = '';
	let subscriptionEndDate = '';

	const getHeaders = () => ({
		'Content-Type': 'application/json',
		Authorization: `Bearer ${get(accessToken)}`
	});

	onMount(async () => {
		try {
			const [payments, subs] = await Promise.all([
				fetchFromAPI<SubscriptionPayment[]>('/subscription-payments/me', {
					headers: getHeaders()
				}),
				fetchFromAPI<Subscription[]>('/subscriptions', {
					headers: getHeaders()
				})
			]);

			myPayments = payments.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
			subscriptions = subs;

			if (myPayments.length > 0) {
				latestSub = myPayments[0];
				const sub = subscriptions.find((s) => s.id === latestSub!.subscriptionId);
				subscriptionName = sub?.name || 'Inconnu';

				const created = new Date(latestSub.createdAt);
				const end = new Date(created.getTime() + 28 * 24 * 60 * 60 * 1000);
				subscriptionEndDate = end.toLocaleDateString();

				subscriptionStatus = end > new Date() ? 'active' : 'expired';
			}
		} catch (err) {
			console.error('Erreur lors du chargement des abonnements', err);
			notifications.error('Impossible de charger les informations d’abonnement');
		}
	});

	function handleManageSubscription() {
		notifications.success("Redirection vers la gestion de l'abonnement...");
		// redirige si une vraie page de gestion est disponible :
		// window.location.href = '/app/clients/subscription/manage';
	}
</script>

<div class="ml-0 min-h-screen max-w-2xl bg-[#FEFCF3] p-6">
	<h1 class="font-author mb-6 text-2xl text-gray-800">{$account_title}</h1>

	<!-- Bloc abonnement -->
	<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
		<p class="mb-2 text-sm text-gray-600">{$my_sub}</p>

		<div class="flex items-center justify-between">
			{#if subscriptionStatus === 'none'}
				<p class="text-gray-500 italic">Aucun abonnement actif.</p>
			{:else}
				<div class="mr-2 flex-grow rounded-md bg-gray-100 px-4 py-2">
					<p class="text-gray-700">
						{subscriptionName}
						<span class="ml-2 text-xs text-gray-500">
							({subscriptionStatus === 'active' ? 'Actif jusqu’au ' : 'Expiré le '}
							{subscriptionEndDate})
						</span>
					</p>
				</div>
			{/if}
			<button
				on:click={handleManageSubscription}
				class="bg-primary text-primary-content hover:bg-primary-focus rounded-md px-6 py-2 text-sm transition-colors"
			>
				{$manage}
			</button>
		</div>
	</div>

	<!-- Bloc Wallet -->
	<WalletBox profileType="client" />
</div>
