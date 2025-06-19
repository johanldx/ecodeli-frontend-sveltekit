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
	const cancel = tStatic('admin.wallets.cancel');
	const close_button = t('admin.wallets.close_button');
	const record_button = t('admin.wallets.record_button');
	const wallet_modify = t('admin.wallets.wallet_modify');
	const wallet_delete = t('admin.wallets.wallet_delete');
	const cancel_delete = t('admin.wallets.cancel_delete');
	const delete_confirmation = t('admin.wallets.delete_confirmation');

	onMount(() => onDestroy(tabTitle('admin.wallets')));

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
	let showModalDelete = false;

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

			data = wallets.map((wallet) => ({
				id: wallet.id,
				user_name: `${wallet.user.first_name} ${wallet.user.last_name}`,
				user_email: wallet.user.email,
				amount_available: formatAmount(wallet.amout_available),
				amount_pending: formatAmount(wallet.amout_pending),
				created_at: formatDate(wallet.created_at),
				edited_at: formatDate(wallet.edited_at),
				actions: [
					{ label: modify, class: 'btn btn-warning' },
					{ label: cancel, class: 'btn btn-error' }
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
		} else if (action === cancel) {
			selectedWallet = row;
			showModalDelete = true;
		}
	}

	function openModal(wallet: any) {
		selectedWallet = wallet;
		editedWallet = { ...wallet };
		fetchWalletDetails(wallet.id);
		showModalEdit = true;
	}

	async function fetchWalletDetails(walletId: string) {
		try {
			const wallet = await fetchFromAPI(`/wallet/all`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			});

			const foundWallet = (wallet as any[]).find(w => w.id === parseInt(walletId));
			if (foundWallet) {
				editedWallet = { 
					...foundWallet,
					amount_available: foundWallet.amout_available,
					amount_pending: foundWallet.amout_pending
				};
			}
		} catch (error) {
			console.error("Erreur lors de la récupération des détails du wallet : ", error);
		}
	}

	function closeModals() {
		showModalEdit = false;
		showModalDelete = false;
	}

	async function deleteWallet() {
		try {
			// Note: Il n'y a pas d'endpoint DELETE pour les wallets dans le backend actuel
			// Cette fonction est préparée pour une future implémentation
			notifications.error('La suppression des wallets n\'est pas encore implémentée');
			closeModals();
		} catch (error: any) {
			closeModals();
			notifications.error('Erreur lors de la suppression du wallet');
		}
	}

	async function modifyWallet() {
		try {
			// Note: Il n'y a pas d'endpoint PATCH pour les wallets dans le backend actuel
			// Cette fonction est préparée pour une future implémentation
			notifications.error('La modification des wallets n\'est pas encore implémentée');
			closeModals();
		} catch (error: any) {
			closeModals();
			notifications.error('Erreur lors de la modification du wallet');
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
					<fieldset class="fieldset">
						<legend>{user_name}</legend>
						<input
							class="input input-bordered"
							value={editedWallet.user_name}
							disabled
						/>
					</fieldset>
					<fieldset class="fieldset">
						<legend>{user_email}</legend>
						<input
							class="input input-bordered"
							value={editedWallet.user_email}
							disabled
						/>
					</fieldset>
					<fieldset class="fieldset">
						<legend>{amount_available}</legend>
						<input
							type="number"
							step="0.01"
							class="input input-bordered"
							bind:value={editedWallet.amount_available}
						/>
					</fieldset>
					<fieldset class="fieldset">
						<legend>{amount_pending}</legend>
						<input
							type="number"
							step="0.01"
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

	<!-- Modale suppression wallet -->
	{#if showModalDelete}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">{$wallet_delete}</h2>
				{#if selectedWallet}
					<p class="text-center">{$delete_confirmation} <strong>{selectedWallet.user_name}</strong> ?</p>
				{/if}
				<div class="modal-action">
					<button class="btn btn-error" on:click={deleteWallet}>{cancel}</button>
					<button class="btn" on:click={closeModals}>{$cancel_delete}</button>
				</div>
			</div>
		</div>
	{/if}
</div> 