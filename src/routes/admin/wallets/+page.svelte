<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { fetchFromAPI } from '$lib/utils/api';
	import Table from '$lib/components/Table.svelte';
	import dayjs from 'dayjs';
	import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
	import { notifications } from '$lib/stores/notifications';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { t, tStatic } from '$lib/utils/t';

	// Traductions pour la gestion des wallets
	const tab_title = t('admin.wallets.tab_title');
	const wallets_title = t('admin.wallets.wallets_title');
	const search_bar = t('admin.wallets.search_bar');
	const user_name = tStatic('admin.wallets.user_name');
	const user_email = tStatic('admin.wallets.user_email');
	const amount_available = tStatic('admin.wallets.amount_available');
	const amount_pending = tStatic('admin.wallets.amount_pending');
	const creation_date = tStatic('admin.wallets.creation_date');
	const last_update = tStatic('admin.wallets.last_update');
	const actions = tStatic('admin.wallets.actions');
	const modify = tStatic('admin.wallets.modify');
	const close_button = t('admin.wallets.close_button');
	const record_button = t('admin.wallets.record_button');
	const wallet_modify = t('admin.wallets.wallet_modify');

	onMount(() => onDestroy(tabTitle('admin.wallets.tab_title')));

	let walletsData: any[] = []; // Stockage des données complètes
	let data: {
		id: string;
		user_name: string;
		user_email: string;
		amount_available: string;
		amount_pending: string;
		created_at: string;
		edited_at: string;
		actions: { label: string; class: string }[];
	}[] = [];

	let columns = [
		{ Header: user_name, accessor: 'user_name', sortable: true },
		{ Header: user_email, accessor: 'user_email', sortable: true },
		{ Header: amount_available, accessor: 'amount_available', sortable: true },
		{ Header: amount_pending, accessor: 'amount_pending', sortable: true },
		{ Header: creation_date, accessor: 'created_at', sortable: true },
		{ Header: last_update, accessor: 'edited_at', sortable: true },
		{ Header: actions, accessor: 'actions', sortable: false }
	];

	let loading = true;

	// Modales
	let showModalEdit = false;

	let selectedWallet: any = null;
	let editedWallet = { ...selectedWallet };

	const formatAmount = (amount: number) => `${amount.toFixed(2)} €`;

	const formatDate = (dateString: string) => dayjs(dateString).format('DD/MM/YYYY HH:mm');

	onMount(async () => {
		try {
			const wallets = (await fetchFromAPI('/wallet/all', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			})) as any[];

			// Stocker les données complètes
			walletsData = wallets;

			data = wallets.map((wallet) => ({
				id: wallet.id,
				user_name: `${wallet.user.first_name} ${wallet.user.last_name}`,
				user_email: wallet.user.email,
				amount_available: formatAmount(wallet.amout_available),
				amount_pending: formatAmount(wallet.amout_pending),
				created_at: formatDate(wallet.created_at),
				edited_at: formatDate(wallet.edited_at),
				actions: [
					{ label: modify, class: 'btn btn-warning' }
				]
			}));

			loading = false;
		} catch (error) {
			console.error('Erreur lors du chargement des wallets :', error);
			notifications.error('Erreur lors du chargement des wallets');
			loading = false;
		}
	});

	function handleAction(action: string, row: any) {
		if (action === modify) {
			openModal(row);
		}
	}

	function openModal(row: any) {
		// Trouver les données complètes du wallet
		const fullWalletData = walletsData.find(w => w.id === parseInt(row.id));
		if (fullWalletData) {
			selectedWallet = row;
			editedWallet = {
				id: fullWalletData.id,
				user_name: `${fullWalletData.user.first_name} ${fullWalletData.user.last_name}`,
				user_email: fullWalletData.user.email,
				amount_available: fullWalletData.amout_available,
				amount_pending: fullWalletData.amout_pending
			};
			showModalEdit = true;
		}
	}

	function closeModals() {
		showModalEdit = false;
	}

	async function modifyWallet() {
		try {
			const updateData = {
				amout_available: parseFloat(editedWallet.amount_available),
				amout_pending: parseFloat(editedWallet.amount_pending)
			};

			await fetchFromAPI(`/wallet/${editedWallet.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				},
				body: JSON.stringify(updateData)
			});

			notifications.success('Le portefeuille a été modifié avec succès.');
			closeModals();
			await new Promise((resolve) => setTimeout(resolve, 1000));
			location.reload();
		} catch (error: any) {
			console.error('Erreur lors de la modification du wallet :', error);
			closeModals();
			notifications.error('Erreur lors de la modification du portefeuille');
		}
	}
</script>

<div class="min-h-screen p-6">
	<h1 class="mt-10 mb-5 text-2xl font-medium">{$wallets_title}</h1>

	{#if loading}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<Table {columns} {data} pageSize={10} onAction={handleAction} />
	{/if}

	<div class="pb-20"></div>

	<!-- Modale d'édition -->
	{#if showModalEdit}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">{$wallet_modify}</h2>
				{#if editedWallet}
					<div class="mb-4 p-3 bg-gray-100 rounded">
						<p class="text-sm text-gray-600"><strong>{user_name}:</strong> {editedWallet.user_name}</p>
						<p class="text-sm text-gray-600"><strong>{user_email}:</strong> {editedWallet.user_email}</p>
					</div>
					<fieldset class="fieldset">
						<legend>{amount_available}</legend>
						<input
							type="number"
							step="0.01"
							min="0"
							class="input input-bordered"
							bind:value={editedWallet.amount_available}
						/>
					</fieldset>
					<fieldset class="fieldset">
						<legend>{amount_pending}</legend>
						<input
							type="number"
							step="0.01"
							min="0"
							class="input input-bordered"
							bind:value={editedWallet.amount_pending}
						/>
					</fieldset>
				{/if}
				<div class="modal-action">
					<button class="btn btn-primary" on:click={modifyWallet}>{$record_button}</button>
					<button class="btn" on:click={closeModals}>{$close_button}</button>
				</div>
			</div>
		</div>
	{/if}
</div> 