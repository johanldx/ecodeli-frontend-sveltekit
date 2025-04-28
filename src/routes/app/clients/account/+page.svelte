<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';

	onMount(() => onDestroy(tabTitle('app.clients.account')));

	let ibanInput: HTMLInputElement; // Référence directe à l'input

	const account_title = t('app.clients.account.my_account.title');
	const my_sub = t('app.clients.account.my_account.my_sub');
	const sub_status_premium = t('app.clients.account.my_account.sub_status_premium');
	const sub_status_basic = t('app.clients.account.my_account.sub_status_basic');
	const sub_status_pro = t('app.clients.account.my_account.sub_status_pro');
	const manage = t('app.clients.account.my_account.manage');
	const manage_global_account = t('app.clients.account.my_account.manage_global_account');
	const manage_addresses = t('app.clients.account.my_account.manage_addresses');
	const wallet_title = t('app.clients.account.my_electronic_wallet.title');
	const amount_available = t('app.clients.account.my_electronic_wallet.amount_available');
	const amount_pending = t('app.clients.account.my_electronic_wallet.amount_pending');
	const to_validate = t('app.clients.account.my_electronic_wallet.to_validate');
	const iban = t('app.clients.account.my_electronic_wallet.iban');
	const transfer_bank_account = t('app.clients.account.my_electronic_wallet.transfer_bank_account');

	function handleManageSubscription() {
		alert("Redirection vers la gestion de l'abonnement...");
	}

	function handleManageAccount() {
		window.location.href = '/auth/account';
	}

	function handleManageAddresses() {
		window.location.href = '/app/clients/addresses';
	}

	function handleValidateIBAN() {
		if (ibanInput && ibanInput.value) {
			alert(`IBAN validé : ${ibanInput.value}`);
		} else {
			alert('Veuillez entrer un IBAN valide.');
		}
	}

	function handleTransferToBank() {
		alert('Redirection vers le transfert vers un compte bancaire...');
	}
</script>

<div class="ml-0 min-h-screen max-w-2xl bg-[#FEFCF3] p-6">
	<h1 class="font-author mb-6 text-2xl text-gray-800">{$account_title}</h1>

	<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
		<div class="mb-4">
			<p class="mb-2 text-sm text-gray-600">{$my_sub}</p>
			<div class="flex items-center">
				<div class="mr-2 flex-grow rounded-md bg-gray-100 px-4 py-2">
					<p class="text-gray-700">{$sub_status_premium}</p>
				</div>

				<button
					on:click={handleManageSubscription}
					class="bg-primary text-primary-content hover:bg-primary-focus rounded-md px-6 py-2 text-sm transition-colors"
				>
					{$manage}
				</button>
			</div>
		</div>

		<button
			on:click={handleManageAccount}
			class="bg-primary text-primary-content hover:bg-primary-focus mb-3 w-full cursor-pointer rounded-md py-3 text-sm transition-colors"
		>
			{$manage_global_account}
		</button>

		<button
			on:click={handleManageAddresses}
			class="bg-secondary text-secondary-content hover:bg-secondary-focus w-full cursor-pointer rounded-md py-3 text-sm transition-colors"
		>
			{$manage_addresses}
		</button>
	</div>

	<h1 class="font-author mb-6 text-2xl text-gray-800">{$wallet_title}</h1>

	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
		<div class="mb-6 flex justify-center gap-16">
			<div class="text-center">
				<p class="font-author text-2xl text-gray-800">49,75 €</p>
				<p class="text-sm text-gray-600">{$amount_available}</p>
			</div>
			<div class="text-center">
				<p class="font-auhtor text-2xl text-gray-800">49,75 €</p>
				<p class="text-sm text-gray-600">{$amount_pending}</p>
			</div>
		</div>

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
	</div>
</div>
