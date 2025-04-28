<script lang="ts">
	import '../../../../app.css';
	import { t } from '$lib/utils/t';
	import { onDestroy, onMount } from 'svelte';
	import { tabTitle } from '$lib/utils/tabTitle';

	onMount(() => onDestroy(tabTitle('app.delivery.account')));

	const title = t('app.delivery.account.title');
	const manage_supporting_documents = t('app.delivery.account.manage_supporting_documents');
	const manage_global_account = t('app.delivery.account.manage_global_account');
	const manage_addresses = t('app.delivery.account.manage_addresses');
	const titles = t('app.delivery.my_electronic_wallet.title');
	const amount_available = t('app.delivery.my_electronic_wallet.amount_available');
	const amount_pending = t('app.delivery.my_electronic_wallet.amount_pending');
	const to_validate = t('app.delivery.my_electronic_wallet.to_validate');
	const transfer_bank_account = t('app.delivery.my_electronic_wallet.transfer_bank_account');
	const delivery_notification = t('app.delivery.notification.delivery_notification');
	const confirmation = t('app.delivery.notification.confirmation');

	// Fonction de validation de l'IBAN
	function handleValidateIBAN() {
		alert("Validation de l'IBAN");
		console.log('IBAN validé');
	}

	// Fonction de transfert vers la banque
	function handleTransferToBank() {
		alert('Transfert vers un compte bancaire');
		console.log('Transfert vers la banque initié');
	}

	// Fonctions de gestion avec alertes
	function handleManageDocuments() {
		alert('Redirection vers la gestion des pièces justificatives');
		console.log('Gérer mes pièces justificatives cliqué');
	}

	function handleManageAccount() {
		alert('Redirection vers la gestion du compte global');
		console.log('Gérer mon compte global cliqué');
	}

	function handleManageAddresses() {
		alert('Redirection vers la gestion des adresses');
		console.log('Gérer mes adresses cliqué');
	}

	// Gestion des notifications
	function handleToggleNotification(event: Event) {
		const checkbox = event.target as HTMLInputElement;
		if (checkbox.checked) {
			alert('Notifications activées');
			console.log('Notifications activées');
		} else {
			alert('Notifications désactivées');
			console.log('Notifications désactivées');
		}
	}

	function handleConfirmNotifications() {
		alert('Notifications confirmées');
		console.log('Notifications confirmées');
	}
</script>

<main class="mx-auto flex w-full max-w-screen-lg flex-col px-4 py-6">
	<h1 class="font-author mb-6 text-2xl">{$title}</h1>

	<!-- Conteneur principal avec disposition en grille -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Colonne de gauche (2/3 de largeur) -->
		<div class="space-y-6 lg:col-span-2">
			<!-- Carte Options du compte -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
				<div class="flex flex-col gap-4">
					<button
						on:click={handleManageDocuments}
						class="bg-primary text-primary-content w-full rounded-md py-2 text-sm transition-colors hover:bg-emerald-500"
					>
						{$manage_supporting_documents}
					</button>

					<button
						on:click={handleManageAccount}
						class="bg-primary text-primary-content w-full rounded-md py-2 text-sm transition-colors hover:bg-emerald-500"
					>
						{$manage_global_account}
					</button>

					<button
						on:click={handleManageAddresses}
						class="bg-neutral w-full rounded-md py-2 text-sm text-white transition-colors hover:bg-gray-700"
					>
						{$manage_addresses}
					</button>
				</div>
			</div>

			<!-- Carte Portefeuille électronique -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
				<h2 class="font-author mb-4 text-2xl">{$titles}</h2>

				<div class="mb-6 flex justify-center gap-16">
					<div class="text-center">
						<p class="font-author text-2xl text-gray-800">49,75 €</p>
						<p class="text-sm text-gray-600">{$amount_available}</p>
					</div>
					<div class="text-center">
						<p class="font-author text-2xl text-gray-800">49,75 €</p>
						<p class="text-sm text-gray-600">{$amount_pending}</p>
					</div>
				</div>

				<div class="mb-4 flex items-center gap-2">
					<input
						type="text"
						placeholder="Mon IBAN"
						class="focus:ring-primary focus:border-primary flex-1 rounded-md border border-gray-300 bg-gray-100 px-4 py-2"
					/>
					<button
						on:click={handleValidateIBAN}
						class="bg-primary text-primary-content rounded-md px-6 py-2 text-sm transition-colors hover:bg-emerald-500"
					>
						{$to_validate}
					</button>
				</div>

				<button
					on:click={handleTransferToBank}
					class="bg-primary text-primary-content w-full rounded-md py-3 text-sm transition-colors hover:bg-emerald-500"
				>
					{$transfer_bank_account}
				</button>
			</div>
		</div>

		<!-- Colonne de droite (1/3 de largeur) - Carte des notifications -->
		<div class="lg:col-span-1">
			<div class="sticky top-6 h-[250px] rounded-lg border border-gray-200 bg-white p-6 shadow-md">
				<div class="flex h-full flex-col items-center justify-center gap-6">
					<div class="flex items-center justify-center">
						<input type="checkbox" class="checkbox" on:change={handleToggleNotification} />
						<h3 class="ml-2 text-center">
							{$delivery_notification}
						</h3>
					</div>
					<button
						on:click={handleConfirmNotifications}
						class="bg-primary text-primary-content rounded-md px-6 py-2 text-sm transition-colors hover:bg-emerald-500"
					>
						{$confirmation}
					</button>
				</div>
			</div>
		</div>
	</div>
</main>
