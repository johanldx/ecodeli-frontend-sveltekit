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

	// des petites constantes pour la traduction du back office :D

	const tab_title = t('admin.users.tab_title');
	const users_title = t('admin.users.users_title');
	const providers_title = t('admin.users.providers_title');
	const delivery_persons_title = t('admin.users.delivery_persons_title');
	const traders_title = t('admin.users.traders_title');
	const clients_title = t('admin.users.clients_title');
	const profiles_title = t('admin.users.profiles_title');
	const search_bar = t('admin.users.search_bar');
	const user_name = tStatic('admin.users.user_name');
	const user_first_name = t('admin.users.user_first_name');
	const user_email = tStatic('admin.users.user_email');
	const status = tStatic('admin.users.status');
	const creation_date = tStatic('admin.users.creation_date');
	const actions = tStatic('admin.users.actions');
	const modify = tStatic('admin.users.modify');
	const cancel = tStatic('admin.users.cancel');
	const next = t('admin.users.next');
	const previous = t('admin.users.previous');
	const page = t('admin.users.page');
	const card_id = tStatic('admin.users.card_id');
	const driving_license = tStatic('admin.users.driving_license');
	const RIB = tStatic('admin.users.RIB');
	const create_it = tStatic('admin.users.create_it');
	const proof_of_activity = tStatic('admin.users.proof_of_activity');
	const certification_document = tStatic('admin.users.certification_document');
	const user_modify = t('admin.users.user_modify');
	const active = tStatic('admin.users.active');
	const verify = t('admin.users.verify');
	const administrator = t('admin.users.administrator');
	const close_button = t('admin.users.close_button');
	const record_button = t('admin.users.record_button');
	const user_delete = t('admin.users.user_delete');
	const cancel_delete = t('admin.users.cancel_delete');
	const delete_confirmation = t('admin.users.delete_confirmation');
	const client_delete = t('admin.users.client_delete');
	const provider_delete = t('admin.users.provider_delete');
	const trader_delete = t('admin.users.trader_delete');
	const delivery_delete = t('admin.users.delivery_delete');
	const delivery_status_modify = t('admin.users.delivery_status_modify');
	const provider_status_modify = t('admin.users.provider_status_modify');
	const trader_status_modify = t('admin.users.trader_status_modify');
	const client_status_modify = t('admin.users.client_status_modify');
	const supplier_delete = t('admin.users.supplier_delete');
	const to_validate = tStatic('admin.users.to_validate');
	const pending = tStatic('admin.users.pending');
	const rejected = tStatic('admin.users.rejected');
	const none_validated = tStatic('admin.users.none_validated');

	onMount(() => onDestroy(tabTitle('admin.users')));

	let data: {
		id: string;
		name: string;
		email: string;
		active: string;
		created_at: string;
		actions: { label: string; class: string }[];
	}[] = [];

	let columns = [
		{ Header: user_name, accessor: 'name', sortable: true },
		{ Header: user_email, accessor: 'email', sortable: true },
		{ Header: status, accessor: 'active', sortable: true },
		{ Header: creation_date, accessor: 'created_at', sortable: true },
		{ Header: actions, accessor: 'actions', sortable: false }
	];

	let loadingUsers = true;
	let loadingClients = true;

	// modales
	let showModalEdit = false;
	let showModalUserDelete = false;
	let showModalClientDelete = false;

	let selectedUser: any = null;
	let editedUser = { ...selectedUser };

	const formatActiveStatus = (status: boolean) =>
		status
			? `<span class="badge badge-success">${active}</span>`
			: `<span class="badge badge-error">Inactif</span>`;

	function formatStatus(status: string) {
		switch (status) {
			case 'approved':
				return `<span class="badge badge-success">${to_validate}</span>`;
			case 'rejected':
				return `<span class="badge badge-error">Rejeté</span>`;
			case 'pending':
			default:
				return `<span class="badge badge-warning">En attente</span>`;
		}
	}

	const formatDate = (dateString: string) => dayjs(dateString).format('DD/MM/YYYY HH:mm');

	onMount(async () => {
		const users = (await fetchFromAPI('/users', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
		})) as any[];

		data = users.map((user) => ({
			id: user.id,
			name: `${user.first_name} ${user.last_name}`,
			email: user.email,
			active: formatActiveStatus(user.active),
			created_at: formatDate(user.created_at),
			actions: [
				{ label: modify, class: 'btn btn-warning' },
				{ label: cancel, class: 'btn btn-error' }
			]
		}));

		loadingUsers = false;
	});

	function handleAction(action: string, row: any) {
		if (action === modify) {
			openModal(row);
		} else if (action === cancel) {
			selectedUser = row;
			showModalUserDelete = true;
		}
	}

	function openModal(user: any) {
		selectedUser = user;
		editedUser = { ...user };
		fetchUserDetails(user.id);
		showModalEdit = true;
	}

	async function fetchUserDetails(userId: string) {
		try {
			const user = await fetchFromAPI(`/users/${userId}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			});

			editedUser = { ...(user || {}) };
		} catch (error) {
			console.error("Erreur lors de la récupération des détails de l'utilisateur : ", error);
		}
	}

	function closeModals() {
		showModalEdit = false;
		showModalUserDelete = false;
		showModalClientDelete = false;
		showModalDeliveryEdit = false;
		showModalDeliveryDelete = false;
		showModalTraderEdit = false;
		showModalTraderDelete = false;
		showModalProviderEdit = false;
		showModalProviderDelete = false;
	}

	async function deleteUser() {
		try {
			const res = await fetchFromAPI(`/users/${selectedUser.id}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			});
			if (res == null) {
				notifications.success("L'utilisateur a bien été supprimé.");
				closeModals();
				await new Promise((resolve) => setTimeout(resolve, 1000));
				location.reload();
			} else {
				notifications.error("Erreur lors de la suppression de l'utilisateur.");
			}
		} catch (error: any) {
			closeModals();
			notifications.error('Erreur');
		}
	}

	async function modifyUser() {
		try {
			const res = await fetchFromAPI(`/users/${editedUser.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				},
				body: JSON.stringify(editedUser)
			});

			notifications.success("L'utilisateur a bien été modifié.");
			closeModals();
			await new Promise((resolve) => setTimeout(resolve, 1000));
			location.reload();
		} catch (error: any) {
			closeModals();
			notifications.error('Erreur');
		}
	}

	// Clients
	let clientsData: any[] = [];
	let clientsColumns = [
		{ Header: user_name, accessor: 'name', sortable: true },
		{ Header: user_email, accessor: 'email', sortable: true },
		{ Header: status, accessor: 'onboarding', sortable: true },
		{ Header: creation_date, accessor: 'created_at', sortable: true },
		{ Header: actions, accessor: 'actions', sortable: false }
	];

	let selectedClient: any = null;
	let editedClient: any = { ...selectedClient };

	onMount(async () => {
		const clients = (await fetchFromAPI('/clients', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
		})) as any[];

		clientsData = clients.map((client) => ({
			id: client.id,
			name: `${client.user.first_name} ${client.user.last_name}`,
			email: client.user.email,
			onboarding: client.onboarding
				? `<span class="badge badge-success">${to_validate}</span>`
				: `<span class="badge badge-error">${none_validated}</span>`,
			created_at: formatDate(client.created_at),
			actions: [{ label: cancel, class: 'btn btn-error' }]
		}));

		loadingClients = false;
	});

	function handleClientAction(action: string, row: any) {
		if (action === cancel) {
			selectedClient = row;
			showModalClientDelete = true;
		}
	}

	async function deleteClient() {
		try {
			const res = await fetchFromAPI(`/clients/${selectedClient.id}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			});
			if (res == null) {
				notifications.success('Le client a bien été supprimé.');
				closeModals();
				await new Promise((resolve) => setTimeout(resolve, 1000));
				location.reload();
			} else {
				notifications.error('Erreur lors de la suppression du client.');
			}
		} catch (error: any) {
			closeModals();
			notifications.error('Erreur');
		}
	}

	// Delivery Persons

	const statusOptions = [
		{ value: 'pending', label: pending },
		{ value: 'approved', label: to_validate },
		{ value: 'rejected', label: rejected }
	];

	let deliveryPersonsData: any[] = [];
	let deliveryPersonsColumns = [
		{ Header: user_name, accessor: 'name', sortable: true },
		{ Header: user_email, accessor: 'email', sortable: true },
		{ Header: status, accessor: 'status', sortable: true },
		{ Header: card_id, accessor: 'identity_card_document', sortable: false },
		{ Header: driving_license, accessor: 'driver_license_document', sortable: false },
		{ Header: RIB, accessor: 'bank_account', sortable: false },
		{ Header: create_it, accessor: 'created_at', sortable: true },
		{ Header: actions, accessor: 'actions', sortable: false }
	];

	let loadingDeliveryPersons = true;
	let selectedDelivery: any = null;
	let editedDelivery: any = {};
	let showModalDeliveryEdit = false;
	let showModalDeliveryDelete = false;

	onMount(async () => {
		const deliveryPersons = (await fetchFromAPI('/delivery-persons', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
		})) as any[];

		deliveryPersonsData = deliveryPersons.map((dp) => ({
			id: dp.id,
			name: `${dp.user.first_name} ${dp.user.last_name}`,
			email: dp.user.email,
			status: formatStatus(dp.status),
			raw_status: dp.status,
			identity_card_document: `<button class="btn btn-sm" onClick="window.open('${dp.identity_card_document}', '_blank')">Voir</button>`,
			driver_license_document: `<button class="btn btn-sm" onClick="window.open('${dp.driver_license_document}', '_blank')">Voir</button>`,
			bank_account: dp.bank_account,
			created_at: formatDate(dp.created_at),
			actions: [
				{ label: modify, class: 'btn btn-warning' },
				{ label: cancel, class: 'btn btn-error' }
			]
		}));

		loadingDeliveryPersons = false;
	});

	function handleDeliveryAction(action: string, row: any) {
		if (action === modify) {
			selectedDelivery = row;
			editedDelivery = { ...row, status: row.raw_status || 'pending' };
			showModalDeliveryEdit = true;
		} else if (action === cancel) {
			selectedDelivery = row;
			showModalDeliveryDelete = true;
		}
	}

	// Commerçants

	const traderStatusList = ['pending', 'approved', 'rejected'];

	let tradersData: any[] = [];
	let tradersColumns = [
		{ Header: user_name, accessor: 'name', sortable: true },
		{ Header: user_name, accessor: 'email', sortable: true },
		{ Header: status, accessor: 'status', sortable: true },
		{ Header: card_id, accessor: 'identity_card_document', sortable: false },
		{ Header: proof_of_activity, accessor: 'proof_of_business_document', sortable: false },
		{ Header: RIB, accessor: 'bank_account', sortable: false },
		{ Header: create_it, accessor: 'created_at', sortable: true },
		{ Header: actions, accessor: 'actions', sortable: false }
	];

	let loadingTraders = true;
	let selectedTrader: any = null;
	let editedTrader: any = {};
	let showModalTraderEdit = false;
	let showModalTraderDelete = false;

	onMount(async () => {
		const traders = (await fetchFromAPI('/traders', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
		})) as any[];

		tradersData = traders.map((trader) => ({
			id: trader.id,
			name: `${trader.user.first_name} ${trader.user.last_name}`,
			email: trader.user.email,
			status: formatStatus(trader.status),
			raw_status: trader.status,
			identity_card_document: `<button class="btn btn-sm" onClick="window.open('${trader.identity_card_document}', '_blank')">Voir</button>`,
			proof_of_business_document: `<button class="btn btn-sm" onClick="window.open('${trader.proof_of_business_document}', '_blank')">Voir</button>`,
			bank_account: trader.bank_account,
			created_at: formatDate(trader.created_at),
			actions: [
				{ label: modify, class: 'btn btn-warning' },
				{ label: cancel, class: 'btn btn-error' }
			]
		}));

		loadingTraders = false;
	});

	function handleTraderAction(action: string, row: any) {
		if (action === modify) {
			selectedTrader = row;
			editedTrader = { ...row, status: row.raw_status || 'pending' };
			showModalTraderEdit = true;
		} else if (action === cancel) {
			selectedTrader = row;
			showModalTraderDelete = true;
		}
	}

	async function modifyTrader() {
		try {
			const res = await fetchFromAPI(`/traders/${editedTrader.id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				},
				body: JSON.stringify({ status: editedTrader.status })
			});

			notifications.success('Le statut du commerçant a bien été mis à jour.');
			closeModals();
			await new Promise((resolve) => setTimeout(resolve, 1000));
			location.reload();
		} catch (error) {
			closeModals();
			notifications.error('Erreur');
		}
	}

	async function deleteTrader() {
		try {
			await fetchFromAPI(`/traders/${selectedTrader.id}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			});

			notifications.success('Le commerçant a bien été supprimé.');
			closeModals();
			await new Promise((resolve) => setTimeout(resolve, 1000));
			location.reload();
		} catch (error) {
			closeModals();
			notifications.error('Erreur');
		}
	}

	async function modifyDelivery() {
		try {
			const res = await fetchFromAPI(`/delivery-persons/${editedDelivery.id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				},
				body: JSON.stringify({ status: editedDelivery.status })
			});

			notifications.success('Le statut du livreur a bien été mis à jour.');
			closeModals();
			await new Promise((resolve) => setTimeout(resolve, 1000));
			location.reload();
		} catch (error) {
			closeModals();
			notifications.error('Erreur');
		}
	}

	async function deleteDelivery() {
		try {
			const res = await fetchFromAPI(`/delivery-persons/${selectedDelivery.id}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			});

			if (res == null) {
				notifications.success('Le livreur a bien été supprimé.');
				closeModals();
				await new Promise((resolve) => setTimeout(resolve, 1000));
				location.reload();
			} else {
				notifications.error('Erreur lors de la suppression.');
			}
		} catch (error) {
			closeModals();
			notifications.error('Erreur');
		}
	}

	let providersData: any[] = [];
	let loadingProviders = true;
	let selectedProvider: any = null;
	let editedProvider: any = {};
	let showModalProviderEdit = false;
	let showModalProviderDelete = false;

	let providersColumns = [
		{ Header: user_name, accessor: 'name', sortable: true },
		{ Header: user_name, accessor: 'email', sortable: true },
		{ Header: status, accessor: 'status', sortable: true },
		{ Header: card_id, accessor: 'identity_card_document', sortable: false },
		{ Header: proof_of_activity, accessor: 'proof_of_business_document', sortable: false },
		{ Header: certification_document, accessor: 'certification_documents', sortable: false },
		{ Header: RIB, accessor: 'bank_account', sortable: false },
		{ Header: create_it, accessor: 'created_at', sortable: true },
		{ Header: actions, accessor: 'actions', sortable: false }
	];

	onMount(async () => {
		const providers = (await fetchFromAPI('/providers', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
		})) as any[];

		providersData = providers.map((p) => ({
			id: p.id,
			name: `${p.user?.first_name ?? 'Utilisateur'} ${p.user?.last_name ?? ''}`,
			email: p.user?.email ?? '',
			status: formatStatus(p.status),
			raw_status: p.status,
			identity_card_document: `<button class="btn btn-sm" onClick="window.open('${p.identity_card_document}', '_blank')">Voir</button>`,
			proof_of_business_document: `<button class="btn btn-sm" onClick="window.open('${p.proof_of_business_document}', '_blank')">Voir</button>`,
			certification_documents: p.certification_documents
				.map(
					(url: string) =>
						`<button class="btn btn-xs mr-1 mb-1" onClick="window.open('${url}', '_blank')">Voir</button>`
				)
				.join(''),
			bank_account: p.bank_account,
			created_at: formatDate(p.created_at),
			actions: [
				{ label: modify, class: 'btn btn-warning' },
				{ label: cancel, class: 'btn btn-error' }
			]
		}));

		loadingProviders = false;
	});

	function handleProviderAction(action: string, row: any) {
		if (action === modify) {
			selectedProvider = row;
			editedProvider = { ...row, status: row.raw_status || 'pending' };
			showModalProviderEdit = true;
		} else if (action === cancel) {
			selectedProvider = row;
			showModalProviderDelete = true;
		}
	}

	async function modifyProvider() {
		try {
			await fetchFromAPI(`/providers/${editedProvider.id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				},
				body: JSON.stringify({ status: editedProvider.status })
			});

			notifications.success('Le statut du fournisseur a bien été mis à jour.');
			closeModals();
			await new Promise((resolve) => setTimeout(resolve, 1000));
			location.reload();
		} catch (error) {
			closeModals();
			notifications.error('Erreur');
		}
	}

	async function deleteProvider() {
		try {
			await fetchFromAPI(`/providers/${selectedProvider.id}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			});

			notifications.success('Le fournisseur a bien été supprimé.');
			closeModals();
			await new Promise((resolve) => setTimeout(resolve, 1000));
			location.reload();
		} catch (error) {
			closeModals();
			notifications.error('Erreur');
		}
	}
</script>

<div class="min-h-screen p-6">
	<!-- Utilisateurs -->
	<h1 class="mt-10 mb-5 text-2xl font-medium">{$users_title}</h1>

	{#if loadingUsers}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<Table {columns} {data} pageSize={5} onAction={handleAction} />
	{/if}

	<h1 class="mt-10 mb-5 text-2xl font-medium">{$profiles_title}</h1>

	<!-- Clients -->
	<h2 class="mt-5 mb-2 text-xl font-medium">{$clients_title}</h2>

	{#if loadingClients}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<Table columns={clientsColumns} data={clientsData} pageSize={5} onAction={handleClientAction} />
	{/if}

	<h2 class="mt-5 mb-2 text-xl font-medium">{$delivery_persons_title}</h2>

	<!-- Delivery Persons -->
	{#if loadingDeliveryPersons}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<Table
			columns={deliveryPersonsColumns}
			data={deliveryPersonsData}
			pageSize={5}
			onAction={handleDeliveryAction}
		/>
	{/if}

	<h2 class="mt-5 mb-2 text-xl font-medium">{$traders_title}</h2>

	{#if loadingTraders}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<Table columns={tradersColumns} data={tradersData} pageSize={5} onAction={handleTraderAction} />
	{/if}

	<div class="pb-20"></div>

	<!-- Modale d'édition -->
	{#if showModalEdit}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">{$user_modify}</h2>
				{#if editedUser}
					<fieldset class="fieldset">
						<legend>{$user_first_name}</legend><input
							class="input input-bordered"
							bind:value={editedUser.first_name}
						/>
					</fieldset>
					<fieldset class="fieldset">
						<legend>{user_name}</legend><input
							class="input input-bordered"
							bind:value={editedUser.last_name}
						/>
					</fieldset>
					<fieldset class="fieldset">
						<legend>{user_email}</legend><input
							class="input input-bordered"
							bind:value={editedUser.email}
						/>
					</fieldset>
					<fieldset class="fieldset">
						<legend>{active}</legend><input
							type="checkbox"
							class="checkbox"
							checked={editedUser.active}
							on:change={() => (editedUser.active = !editedUser.active)}
						/>
					</fieldset>
					<fieldset class="fieldset">
						<legend>{$verify}</legend><input
							type="checkbox"
							class="checkbox"
							checked={editedUser.verified}
							on:change={() => (editedUser.verified = !editedUser.verified)}
						/>
					</fieldset>
					<fieldset class="fieldset">
						<legend>{$administrator}</legend><input
							type="checkbox"
							class="checkbox"
							checked={editedUser.administrator}
							on:change={() => (editedUser.administrator = !editedUser.administrator)}
						/>
					</fieldset>
				{/if}
				<div class="modal-action">
					<button class="btn btn-primary" on:click={modifyUser}>{$record_button}</button>
					<button class="btn" on:click={closeModals}>{$close_button}</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modale suppression utilisateur -->
	{#if showModalUserDelete}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">{$user_delete}</h2>
				{#if selectedUser}
					<p class="text-center">{$delete_confirmation}</p>
				{/if}
				<div class="modal-action">
					<button class="btn btn-error" on:click={deleteUser}>{cancel}</button>
					<button class="btn" on:click={closeModals}>{$cancel_delete}</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modale suppression client -->
	{#if showModalClientDelete}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">{$client_delete}</h2>
				{#if selectedClient}
					<p class="text-center">{$delete_confirmation}<strong>{selectedClient.name}</strong> ?</p>
				{/if}
				<div class="modal-action">
					<button class="btn btn-error" on:click={deleteClient}>{cancel}</button>
					<button class="btn" on:click={closeModals}>{$cancel_delete}</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showModalDeliveryEdit}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">{delivery_status_modify}</h2>
				<label class="label" for="delivery-status">{status}</label>
				<select
					id="delivery-status"
					class="select select-bordered w-full"
					bind:value={editedDelivery.status}
				>
					{#each statusOptions as statusOption}
						<option value={statusOption.value}>{statusOption.label}</option>
					{/each}
				</select>
				<div class="modal-action">
					<button class="btn btn-primary" on:click={modifyDelivery}>{$record_button}</button>
					<button class="btn" on:click={closeModals}>{$close_button}</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showModalDeliveryDelete}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">{$delivery_delete}</h2>
				{#if selectedDelivery}
					<p class="text-center">
						{$delete_confirmation}<strong>{selectedDelivery.name}</strong> ?
					</p>
				{/if}
				<div class="modal-action">
					<button class="btn btn-error" on:click={deleteDelivery}>{cancel}</button>
					<button class="btn" on:click={closeModals}>{$cancel_delete}</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showModalTraderEdit}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">{$trader_status_modify}</h2>
				<label class="label" for="trader-status">{status}</label>
				<select
					id="trader-status"
					class="select select-bordered w-full"
					bind:value={editedTrader.status}
				>
					{#each statusOptions as statusOption}
						<option value={statusOption.value}>{statusOption.label}</option>
					{/each}
				</select>

				<div class="modal-action">
					<button class="btn btn-primary" on:click={modifyTrader}>{$record_button}</button>
					<button class="btn" on:click={closeModals}>{$close_button}</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showModalTraderDelete}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">{$trader_delete}</h2>
				{#if selectedTrader}
					<p class="text-center">{$delete_confirmation}<strong>{selectedTrader.name}</strong> ?</p>
				{/if}
				<div class="modal-action">
					<button class="btn btn-error" on:click={deleteTrader}>{cancel}</button>
					<button class="btn" on:click={closeModals}>{$cancel_delete}</button>
				</div>
			</div>
		</div>
	{/if}

	<h2 class="mt-5 mb-2 text-xl font-medium">{$providers_title}</h2>

	{#if loadingProviders}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<Table
			columns={providersColumns}
			data={providersData}
			pageSize={5}
			onAction={handleProviderAction}
		/>
	{/if}

	{#if showModalProviderEdit}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">{$provider_status_modify}</h2>
				<label class="label" for="provider-status">{status}</label>
				<select
					id="provider-status"
					class="select select-bordered w-full"
					bind:value={editedProvider.status}
				>
					{#each statusOptions as statusOption}
						<option value={statusOption.value}>{statusOption.label}</option>
					{/each}
				</select>
				<div class="modal-action">
					<button class="btn btn-primary" on:click={modifyProvider}>{$record_button}</button>
					<button class="btn" on:click={closeModals}>{$close_button}</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showModalProviderDelete}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">{$supplier_delete}</h2>
				{#if selectedProvider}
					<p class="text-center">
						{$delete_confirmation}<strong>{selectedProvider.name}</strong> ?
					</p>
				{/if}
				<div class="modal-action">
					<button class="btn btn-error" on:click={deleteProvider}>{cancel}</button>
					<button class="btn" on:click={closeModals}>{$cancel_delete}</button>
				</div>
			</div>
		</div>
	{/if}
</div>
