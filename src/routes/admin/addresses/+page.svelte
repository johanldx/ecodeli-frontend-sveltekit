<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import Table from '$lib/components/Table.svelte';
	import { fetchFromAPI } from '$lib/utils/api';
	import { accessToken } from '$lib/stores/token';
	import { notifications } from '$lib/stores/notifications';
	import dayjs from 'dayjs';
	import { tabTitle } from '$lib/utils/tabTitle';

	type Address = {
		id: number;
		userId: number;
		name: string;
		address: string;
		cp: string;
		city: string;
		country: string;
		created_at: string;
		user: {
			id: number;
			first_name: string;
			last_name: string;
			email: string;
		};
	};

	let loading = true;
	let data: any[] = [];
	let columns = [
		{ Header: 'Nom utilisateur', accessor: 'user_name', sortable: true },
		{ Header: 'Email', accessor: 'user_email', sortable: true },
		{ Header: 'Nom adresse', accessor: 'name', sortable: true },
		{ Header: 'Adresse', accessor: 'address', sortable: true },
		{ Header: 'Code postal', accessor: 'cp', sortable: true },
		{ Header: 'Ville', accessor: 'city', sortable: true },
		{ Header: 'Pays', accessor: 'country', sortable: true },
		{ Header: 'Créé le', accessor: 'created_at', sortable: true },
		{ Header: 'Actions', accessor: 'actions', sortable: false }
	];

	let selectedAddress: Address | null = null;
	let editedAddress: Address = {
		id: 0,
		userId: 0,
		name: '',
		address: '',
		cp: '',
		city: '',
		country: '',
		created_at: '',
		user: { id: 0, first_name: '', last_name: '', email: '' }
	};
	let showModalEdit = false;
	let showModalDelete = false;

	const formatDate = (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm');

	async function loadAddresses() {
		try {
			const res = await fetchFromAPI<Address[]>('/locations', {
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			});

			console.log('Données reçues :', res);

			data = res.map((a) => ({
				...a,
				user_name: `${a.user.first_name} ${a.user.last_name}`,
				user_email: a.user.email,
				created_at: formatDate(a.created_at),
				actions: [
					{ label: 'Modifier', class: 'btn btn-warning' },
					{ label: 'Supprimer', class: 'btn btn-error' }
				]
			}));

			loading = false;
		} catch {
			notifications.error('Erreur lors du chargement des adresses.');
		}
	}

	onMount(loadAddresses);
	onMount(() => onDestroy(tabTitle('admin.addresses')));

	function handleAction(action: string, row: any) {
		if (action === 'Modifier') {
			editedAddress = { ...row };
			showModalEdit = true;
		} else if (action === 'Supprimer') {
			selectedAddress = row;
			showModalDelete = true;
		}
	}

	async function closeModals() {
		showModalEdit = false;
		showModalDelete = false;
		await new Promise((resolve) => setTimeout(resolve, 1000));
		location.reload();
	}

	async function deleteAddress() {
		if (!selectedAddress) return;
		try {
			await fetchFromAPI(`/locations/${selectedAddress.id}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			});
			notifications.success('Adresse supprimée.');
			closeModals();
			await loadAddresses();
		} catch {
			notifications.error('Erreur lors de la suppression.');
		}
	}

	async function saveAddress() {
		if (!editedAddress) return;
		try {
			await fetchFromAPI(`/locations/${editedAddress.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				},
				body: JSON.stringify(editedAddress)
			});
			notifications.success('Adresse mise à jour.');
			closeModals();
			await loadAddresses();
		} catch {
			notifications.error("Erreur lors de l'enregistrement.");
		}
	}
</script>

<div class="min-h-screen p-6">
	<h1 class="mt-10 mb-5 text-2xl font-medium">Adresses</h1>

	{#if loading}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<Table {columns} {data} pageSize={10} onAction={handleAction} />
	{/if}

	<!-- Modale Édition -->
	{#if showModalEdit}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-4 text-center text-xl font-semibold">Modifier l’adresse</h2>
				<input
					class="input input-bordered mb-2 w-full"
					bind:value={editedAddress.name}
					placeholder="Nom"
				/>
				<input
					class="input input-bordered mb-2 w-full"
					bind:value={editedAddress.address}
					placeholder="Adresse"
				/>
				<input
					class="input input-bordered mb-2 w-full"
					bind:value={editedAddress.cp}
					placeholder="Code postal"
				/>
				<input
					class="input input-bordered mb-2 w-full"
					bind:value={editedAddress.city}
					placeholder="Ville"
				/>
				<input
					class="input input-bordered mb-2 w-full"
					bind:value={editedAddress.country}
					placeholder="Pays"
				/>
				<div class="modal-action">
					<button class="btn btn-primary" on:click={saveAddress}>Enregistrer</button>
					<button class="btn" on:click={closeModals}>Annuler</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modale Suppression -->
	{#if showModalDelete}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-4 text-center text-xl font-semibold">Supprimer l’adresse</h2>
				{#if selectedAddress}
					<p class="text-center">
						Confirmez-vous la suppression de l’adresse <strong>{selectedAddress.name}</strong> ?
					</p>
				{/if}
				<div class="modal-action">
					<button class="btn btn-error" on:click={deleteAddress}>Supprimer</button>
					<button class="btn" on:click={closeModals}>Annuler</button>
				</div>
			</div>
		</div>
	{/if}
</div>
