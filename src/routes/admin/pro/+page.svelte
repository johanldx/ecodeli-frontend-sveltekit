<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import Table from '$lib/components/Table.svelte';
	import { fetchFromAPI } from '$lib/utils/api';
	import { accessToken } from '$lib/stores/token';
	import { notifications } from '$lib/stores/notifications';
	import dayjs from 'dayjs';

	// ——— Typage pour les ServiceTypes —————————————————————
	interface ServiceType {
		id: number;
		name: string;
	}

	// —— Personal Service Types ——
	let typesData: any[] = [];
	let loadingTypes = true;

	const typesColumns = [
		{ Header: 'ID', accessor: 'id', sortable: true },
		{ Header: 'Nom', accessor: 'name', sortable: true },
		{ Header: 'Créé le', accessor: 'created_at', sortable: true },
		{ Header: 'Modifié le', accessor: 'edited_at', sortable: true },
		{ Header: 'Actions', accessor: 'actions', sortable: false }
	];

	let showModalType = false;
	let showModalTypeDelete = false;
	let isEditingType = false;
	let selectedType: any = null;
	let typeName = '';

	function openTypeModal(edit = false, row: any = null) {
		isEditingType = edit;
		selectedType = edit ? row : null;
		typeName = edit ? row.name : '';
		showModalType = true;
	}
	function openDeleteTypeModal(row: any) {
		selectedType = row;
		showModalTypeDelete = true;
	}
	function closeTypeModals() {
		showModalType = false;
		showModalTypeDelete = false;
		selectedType = null;
		typeName = '';
	}

	async function loadTypes() {
		loadingTypes = true;
		try {
			const list = (await fetchFromAPI('/personal-service-types', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				}
			})) as any[];
			typesData = list.map((t) => ({
				id: t.id,
				name: t.name,
				created_at: formatDate(t.createdAt),
				edited_at: formatDate(t.editedAt),
				actions: [
					{ label: 'Modifier', class: 'btn btn-sm btn-warning' },
					{ label: 'Supprimer', class: 'btn btn-sm btn-error' }
				]
			}));
		} catch {
			notifications.error('Erreur de chargement des types');
		} finally {
			loadingTypes = false;
		}
	}

	async function saveType() {
		try {
			if (isEditingType) {
				await fetchFromAPI(`/personal-service-types/${selectedType.id}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${get(accessToken)}`
					},
					body: JSON.stringify({ name: typeName })
				});
				notifications.success('Type mis à jour');
			} else {
				await fetchFromAPI('/personal-service-types', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${get(accessToken)}`
					},
					body: JSON.stringify({ name: typeName })
				});
				notifications.success('Type créé');
			}
			closeTypeModals();
			await loadTypes();
		} catch {
			notifications.error("Erreur lors de l'enregistrement");
		}
	}

	async function deleteType() {
		try {
			await fetchFromAPI(`/personal-service-types/${selectedType.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				}
			});
			notifications.success('Type supprimé');
			closeTypeModals();
			await loadTypes();
		} catch {
			notifications.error('Erreur lors de la suppression');
		}
	}

	// —— Providers ——
	let providersData: any[] = [];
	let loadingProviders = true;

	const providersColumns = [
		{ Header: 'Nom', accessor: 'name', sortable: true },
		{ Header: 'Statut', accessor: 'status', sortable: true },
		{ Header: "Carte d'identité", accessor: 'identity_card_document', sortable: false },
		{ Header: "Justificatif d'activité", accessor: 'proof_of_business_document', sortable: false },
		{ Header: 'Document de certification', accessor: 'certification_documents', sortable: false },
		{ Header: 'RIB', accessor: 'bank_account', sortable: false },
		{ Header: 'Crée le', accessor: 'created_at', sortable: true },
		{ Header: 'Actions', accessor: 'actions', sortable: false }
	];

	let showModalAuth = false;
	let selectedProvider: any = null;
	let serviceTypes: ServiceType[] = [];
	let currentAuthIds: number[] = [];
	let selectedAuthIds: number[] = [];

	const formatDate = (d: string) => dayjs(d).format('DD/MM/YYYY HH:mm');

	async function loadProviders() {
		loadingProviders = true;
		try {
			const all = (await fetchFromAPI('/providers', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				}
			})) as any[];
			providersData = all
				.filter((p) => p.status === 'approved')
				.map((p) => ({
					id: p.id,
					name: `${p.user.first_name} ${p.user.last_name}`,
					status: `<span class="badge badge-success">Validé</span>`,
					identity_card_document: `<button class="btn btn-sm" onClick="window.open('${p.identity_card_document}','_blank')">Voir</button>`,
					proof_of_business_document: `<button class="btn btn-sm" onClick="window.open('${p.proof_of_business_document}','_blank')">Voir</button>`,
					certification_documents: p.certification_documents
						.map(
							(url: string) =>
								`<button class="btn btn-xs mr-1 mb-1" onClick="window.open('${url}','_blank')">Voir</button>`
						)
						.join(''),
					bank_account: p.bank_account,
					created_at: formatDate(p.created_at),
					actions: [{ label: 'Gérer autorisations', class: 'btn btn-primary' }]
				}));
		} catch {
			notifications.error('Erreur de chargement des providers');
		} finally {
			loadingProviders = false;
		}
	}

	async function handleAction(action: string, row: any) {
		if (action === 'Gérer autorisations') {
			selectedProvider = row;
			// liste de tous les types
			serviceTypes = (await fetchFromAPI('/personal-service-types', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				}
			})) as ServiceType[];

			// pour chaque type, check via GET /:providerId/:typeId
			const authChecks = await Promise.all(
				serviceTypes.map(async (st) => {
					try {
						await fetchFromAPI(`/personal-service-type-authorizations/${row.id}/${st.id}`, {
							method: 'GET',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${get(accessToken)}`
							}
						});
						return st.id;
					} catch {
						return null;
					}
				})
			);
			currentAuthIds = authChecks.filter((id) => id !== null) as number[];
			selectedAuthIds = [...currentAuthIds];
			showModalAuth = true;
		}
	}

	async function closeAuthModal() {
		showModalAuth = false;
		selectedProvider = null;
		serviceTypes = [];
		currentAuthIds = [];
		selectedAuthIds = [];
		await new Promise((resolve) => setTimeout(resolve, 1000));
		location.reload();
	}

	async function saveAuthorizations() {
		try {
			const toAdd = selectedAuthIds.filter((id) => !currentAuthIds.includes(id));
			const toRemove = currentAuthIds.filter((id) => !selectedAuthIds.includes(id));

			await Promise.all([
				...toAdd.map((id) =>
					fetchFromAPI('/personal-service-type-authorizations', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${get(accessToken)}`
						},
						body: JSON.stringify({ providerId: selectedProvider.id, personalServiceTypeId: id })
					})
				),
				...toRemove.map((id) =>
					fetchFromAPI(`/personal-service-type-authorizations/${selectedProvider.id}/${id}`, {
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${get(accessToken)}`
						}
					})
				)
			]);

			notifications.success('Autorisations mises à jour');
			closeAuthModal();
			await loadProviders();
		} catch {
			notifications.error('Erreur lors de la mise à jour');
		}
	}

	onMount(() => {
		loadTypes();
		loadProviders();
	});
</script>

<div class="min-h-screen p-6">
	<!-- Service Types -->
	<h1 class="mt-10 mb-5 text-2xl font-medium">Gestion des type des services</h1>
	{#if loadingTypes}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<button class="btn btn-primary mb-4" on:click={() => openTypeModal(false)}>
			Nouveau type
		</button>
		<Table
			columns={typesColumns}
			data={typesData}
			pageSize={5}
			onAction={(action, row) => {
				if (action === 'Modifier') openTypeModal(true, row);
				if (action === 'Supprimer') openDeleteTypeModal(row);
			}}
		/>
	{/if}

	{#if showModalType}
		<div class="modal modal-open">
			<div class="modal-box w-1/3">
				<h2 class="mb-5 text-center text-xl font-semibold">
					{isEditingType ? 'Modifier le type' : 'Nouveau type'}
				</h2>
				<fieldset class="fieldset mb-4">
					<legend>Nom</legend>
					<input
						class="input input-bordered w-full"
						bind:value={typeName}
						placeholder="Entrez le nom du type"
					/>
				</fieldset>
				<div class="modal-action">
					<button class="btn btn-primary" on:click={saveType}>Enregistrer</button>
					<button class="btn" on:click={closeTypeModals}>Fermer</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showModalTypeDelete}
		<div class="modal modal-open">
			<div class="modal-box">
				<h2 class="mb-5 text-center text-xl font-semibold">Supprimer le type</h2>
				<p class="text-center">Confirmer la suppression de « {selectedType.name} » ?</p>
				<div class="modal-action">
					<button class="btn btn-error" on:click={deleteType}>Supprimer</button>
					<button class="btn" on:click={closeTypeModals}>Annuler</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Providers -->
	<h1 class="mt-16 mb-5 text-2xl font-medium">Gestion des prestataires</h1>
	{#if loadingProviders}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<Table columns={providersColumns} data={providersData} pageSize={5} onAction={handleAction} />
	{/if}

	<!-- Autorisations Modal -->
	{#if showModalAuth}
		<div class="modal modal-open">
			<div class="modal-box w-3/5">
				<h2 class="mb-5 text-center text-xl font-semibold">Gérer les autorisations</h2>
				<fieldset class="fieldset mb-4">
					<legend>Types de service autorisés</legend>
					<div
						class="grid max-h-64 grid-cols-2 gap-4 overflow-auto rounded border p-2 sm:grid-cols-3"
					>
						{#each serviceTypes as serviceType}
							<label class="flex items-center">
								<input
									type="checkbox"
									class="checkbox mr-2"
									bind:group={selectedAuthIds}
									value={serviceType.id}
								/>
								{serviceType.name}
							</label>
						{/each}
					</div>
				</fieldset>
				<div class="modal-action">
					<button class="btn btn-primary" on:click={saveAuthorizations}> Enregistrer </button>
					<button class="btn" on:click={closeAuthModal}> Fermer </button>
				</div>
			</div>
		</div>
	{/if}
</div>
