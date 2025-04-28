<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';

	onMount(() => onDestroy(tabTitle('app.traders.account')));

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
	<div class="mx-auto max-w-6xl">
		<h1 class="font-author mb-6 text-2xl text-gray-800">{$title}</h1>

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
							{$manage_my_addresses}
						</button>
					</div>
				</div>

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

			<div class="mt-6 lg:mt-0 lg:w-1/3">
				<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
					<h2 class="font-author mb-2 text-xl">{$pricing_title} -15%</h2>
					<p class="mb-4 text-sm text-gray-600">{$customer_service}</p>

					<button
						on:click={handleContactSupport}
						class="bg-neutral w-full rounded-md px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
					>
						{$customer_contact}
					</button>
				</div>

				<h2 class="font-author mb-4 text-xl text-gray-800">{$invoice_title}</h2>
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
