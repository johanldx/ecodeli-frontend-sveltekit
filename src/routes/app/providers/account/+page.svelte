<script lang="ts">
	import { notifications } from '$lib/stores/notifications';
	import { profileIds } from '$lib/stores/profiles';
	import { accessToken } from '$lib/stores/token';
	import { fetchFromAPI } from '$lib/utils/api';
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';

	let serviceTypes: ServiceType[] = [];
	let authorizedTypeIds: number[] = [];

	type ServiceType = {
		id: number;
		name: string;
	};

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

			const auths = await fetchFromAPI<{ personalServiceTypeId: number }[]>(
				`/personal-service-type-authorizations?providerId=${get(profileIds).providerId}`,
				{ headers: getHeaders() }
			);
			authorizedTypeIds = auths.map((a) => a.personalServiceTypeId);
		} catch {
			notifications.error('Erreur lors du chargement des types de prestations');
		}
	}

	onMount(() => {
		loadServiceTypes();
		onDestroy(tabTitle('app.providers'));
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

	function handleManageProfil() {
		alert('Redirection vers la gestion du profil...');
	}

	function handleValidateIBAN() {
		alert("Validation de l'IBAN...");
	}
</script>

<div class="bg-base-200 mx-auto min-h-screen p-6">
	<div class="mx-auto max-w-6xl">
		<h1 class="font-author mb-6 text-2xl text-gray-800">{$account_title}</h1>

		<div class="mt-6 lg:mt-0 lg:w-1/3">
			<h2 class="font-author my-4 text-xl text-gray-800">Services accrédités</h2>
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
				<div class="space-y-1">
					{#each serviceTypes as service}
						<div
							class={authorizedTypeIds.includes(service.id) ? '' : ' text-gray-500 line-through'}
						>
							<p class="text-sm">{service.name}</p>
						</div>
					{/each}
					<a href="mailto:hello@ecodeli.fr" class="btn btn-neutral mt-2 w-full"
						>{$customer_service}</a
					>
				</div>
			</div>
		</div>

		<div class="mt-5 lg:w-2/3">
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
			<h2 class="font-author my-4 text-xl text-gray-800">{$invoice}</h2>
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
