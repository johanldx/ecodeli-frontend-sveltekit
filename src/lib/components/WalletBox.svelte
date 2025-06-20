<script lang="ts">
	import { notifications } from '$lib/stores/notifications';
	import { profileIds } from '$lib/stores/profiles';
	import { accessToken } from '$lib/stores/token';
	import { fetchFromAPI } from '$lib/utils/api';
	import { t } from '$lib/utils/t';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	// Paramètre passé au composant
	export let profileType: 'clients' | 'providers' | 'delivery-persons' | 'traders';

	type WalletResponse = {
		amout_available: number;
		amout_pending: number;
	};

	let amount_available = '';
	let amount_pending = '';
	let ibanInput: HTMLInputElement;

	const wallet_title = t('app.clients.account.my_electronic_wallet.title');
	const to_validate = t('app.clients.account.my_electronic_wallet.to_validate');
	const transfer_bank_account = t('app.clients.account.my_electronic_wallet.transfer_bank_account');
	const iban = t('app.clients.account.my_electronic_wallet.iban');
	const available = t('app.clients.account.my_electronic_wallet.available');
	const pending = t('app.clients.account.my_electronic_wallet.pending');

	const getHeaders = () => ({
		'Content-Type': 'application/json',
		Authorization: `Bearer ${get(accessToken)}`
	});

	onMount(async () => {
		try {
			const wallet = await fetchFromAPI<WalletResponse>('/wallet', {
				headers: getHeaders()
			});
			amount_available = `${wallet.amout_available.toFixed(2)} €`;
			amount_pending = `${wallet.amout_pending.toFixed(2)} €`;
		} catch (e) {
			console.error('Erreur lors du chargement du wallet', e);
		}
	});

	async function handleValidateIBAN() {
		let endpoint = '';
		let profile = get(profileIds);

		switch (profileType) {
			case 'clients':
				endpoint = `/clients/${profile.clientId}`;
				break;
			case 'providers':
				endpoint = `/providers/${profile.providerId}`;
				break;
			case 'delivery-persons':
				endpoint = `/delivery-persons/${profile.deliveryPersonId}`;
				break;
			case 'traders':
				endpoint = `/traders/${profile.traderId}`;
				break;
			default:
				notifications.warning(`Type de profil inconnu : ${profileType}`);
				return;
		}

		try {
			await fetchFromAPI(endpoint, {
				method: 'PUT',
				headers: getHeaders(),
				body: JSON.stringify({ bank_account: ibanInput.value })
			});
			notifications.success('IBAN envoyé avec succès');
		} catch (err) {
			console.error('Erreur lors de la validation de l’IBAN', err);
			notifications.error('Erreur lors de la validation de l’IBAN');
		}
	}

	function parseAmount(amountStr: string): number {
		const clean = amountStr.replace(/[^\d.,]/g, '').replace(',', '.');
		return parseFloat(clean);
	}

	async function handleTransferToBank() {
		const amount = parseAmount(amount_available);

		if (!amount || amount <= 0) {
			notifications.warning('Aucun montant disponible à transférer.');
			return;
		}

		try {
			await fetchFromAPI('/wallet-transactions', {
				method: 'POST',
				headers: getHeaders(),
				body: JSON.stringify({
					type: 'withdrawal',
					amount,
					is_available: true
				})
			});

			notifications.success('Montant transféré avec succès');
			await new Promise((resolve) => setTimeout(resolve, 1000));
			location.reload();
		} catch (e) {
			console.error('Erreur lors du transfert bancaire', e);
			notifications.error('Erreur lors du transfert');
		}
	}
</script>

<h1 class="font-author mb-6 text-2xl text-gray-800">{$wallet_title}</h1>

<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
	<div class="mb-6 flex justify-center gap-16">
		<div class="text-center">
			<p class="font-author text-2xl text-gray-800">{amount_available}</p>
			<p class="text-sm text-gray-600">{$available}</p>
		</div>
		<div class="text-center">
			<p class="font-author text-2xl text-gray-800">{amount_pending}</p>
			<p class="text-sm text-gray-600">{$pending}</p>
		</div>
	</div>
	{#if profileType !== 'providers'}
		<div class="mb-4 flex items-center gap-2">
				<input
					bind:this={ibanInput}
					type="text"
					placeholder={$iban}
					class="focus:ring-primary focus:border-primary w-0 flex-[1_1_auto] rounded-md border border-gray-300 bg-gray-100 px-4 py-2"
				/>

				<button
					on:click={handleValidateIBAN}
					class="bg-primary text-primary-content hover:bg-primary-focus flex-none rounded-md px-6 py-2 text-sm transition-colors"
				>
					{$to_validate}
				</button>
		</div>

		<button
			on:click={handleTransferToBank}
			class="bg-primary text-primary-content hover:bg-primary-focus w-full rounded-md py-3 text-sm transition-colors"
		>
			{$transfer_bank_account}
		</button>
	{/if}
</div>
