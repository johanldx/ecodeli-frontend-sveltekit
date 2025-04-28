<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';

	onMount(() => onDestroy(tabTitle('app.providers')));

	const account_title = t('app.providers.account.title');
	const manage_my_documents = t('app.providers.account.manage_my_documents');
	const manage_global_account = t('app.providers.account.manage_global_account');
	const manage_addresses = t('app.providers.account.manage_addresses');
	const manage_my_profil = t('app.providers.account.manage_my_profil');

	const income = t('app.providers.income.title');
	const amount_raised_month = t('app.providers.income.amount_raised_month');
	const iban = t('app.providers.income.iban');
	const valid = t('app.providers.income.valid');

	const title_service = t('app.providers.service.title');
	const transport = t('app.providers.service.transport');
	const gardening = t('app.providers.service.gardening');
	const childcare = t('app.providers.service.childcare');
	const request = t('app.providers.service.request');
	const customer_service = t('app.providers.service.customer_service');

	const invoice = t('app.providers.invoice.title');

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
	function handleManageProfil() {
		alert('Redirection vers la gestion du profil...');
	}
	function handleValidateIBAN() {
		alert("Validation de l'IBAN...");
	}
</script>

<div class="bg-[#FEFCF3] p-6">
	<div class="mx-auto max-w-6xl">
		<h1 class="font-author mb-6 text-2xl text-gray-800">{$account_title}</h1>

		<div class="flex flex-col lg:flex-row lg:gap-6">
			<div class="lg:w-2/3">
				<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
					<div class="space-y-4">
						<button
							on:click={handleManageDocuments}
							class="bg-primary text-primary-content w-full rounded-md py-2 text-sm transition-colors hover:bg-emerald-500"
						>
							{$manage_my_documents}
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
						<button
							on:click={handleManageProfil}
							class="bg-neutral w-full rounded-md py-2 text-sm text-white transition-colors hover:bg-gray-700"
						>
							{$manage_my_profil}
						</button>
					</div>
				</div>

				<h2 class="font-author mb-4 text-xl text-gray-800">{$income}</h2>
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
					<div class="mb-6 flex justify-center gap-16">
						<div class="text-center">
							<p class="font-author text-2xl text-gray-800">490,75 €</p>
							<p class="text-sm text-gray-600">{$amount_raised_month}</p>
						</div>
					</div>

					<div class="mb-4 flex items-center gap-2">
						<input
							type="text"
							placeholder="Mon IBAN"
							class="focus:ring-primary focus:border-primary w-0 flex-[1_1_auto] rounded-md border border-gray-300 bg-gray-100 px-4 py-2"
						/>
						<button
							on:click={handleValidateIBAN}
							class="bg-primary text-primary-content hover:bg-primary-focus flex-none rounded-md px-6 py-2 text-sm transition-colors"
						>
							{$valid}
						</button>
					</div>
				</div>
			</div>

			<div class="mt-6 lg:mt-0 lg:w-1/3">
				<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
					<h2 class="font-author mb-2 text-xl">{$title_service}</h2>
					<p class="text-x1 font-author text-primary-content mb-4">
						{$transport} (43€) <br />
						{$gardening} (124€ / heure) <br />
						{$childcare} (60€ / heure)
					</p>
					<p class="mb-4 text-sm text-gray-200">{$request}</p>
					<button
						on:click={handleContactSupport}
						class="bg-neutral w-full rounded-md px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
					>
						{$customer_service}
					</button>
				</div>

				<h2 class="font-author mb-4 text-xl text-gray-800">{$invoice}</h2>
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
					<div class="space-y-3">
						<button
							on:click={() => handleViewInvoice('Octobre 2024')}
							class="flex w-full items-center justify-between rounded-md p-3 text-left transition-colors hover:bg-gray-50"
						>
							<span>Octobre 2024</span>
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

						<button
							on:click={() => handleViewInvoice('Novembre 2024')}
							class="flex w-full items-center justify-between rounded-md p-3 text-left transition-colors hover:bg-gray-50"
						>
							<span>Novembre 2024</span>
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

						<button
							on:click={() => handleViewInvoice('Décembre 2024')}
							class="flex w-full items-center justify-between rounded-md p-3 text-left transition-colors hover:bg-gray-50"
						>
							<span>Décembre 2024</span>
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
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
