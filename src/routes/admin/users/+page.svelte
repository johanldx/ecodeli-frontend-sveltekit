<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { fetchFromAPI } from '$lib/utils/api';
  import Table from '$lib/components/Table.svelte';
  import dayjs from 'dayjs';
  import { get } from 'svelte/store';
  import { accessToken } from '$lib/stores/token';
  import { notifications } from '$lib/stores/notifications';
	import { tabTitle } from '$lib/utils/tabTitle';

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
    { Header: 'Nom', accessor: 'name', sortable: true },
    { Header: 'Email', accessor: 'email', sortable: true },
    { Header: 'Statut', accessor: 'active', sortable: true },
    { Header: 'Date de création', accessor: 'created_at', sortable: true },
    { Header: 'Actions', accessor: 'actions', sortable: false }
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
    status ? `<span class="badge badge-success">Actif</span>` : `<span class="badge badge-error">Inactif</span>`;

  function formatStatus(status: string) {
    switch (status) {
      case 'approved':
        return `<span class="badge badge-success">Validé</span>`;
      case 'rejected':
        return `<span class="badge badge-error">Rejeté</span>`;
      case 'pending':
      default:
        return `<span class="badge badge-warning">En attente</span>`;
    }
  }


  const formatDate = (dateString: string) => dayjs(dateString).format('DD/MM/YYYY HH:mm');

  onMount(async () => {
    const users = await fetchFromAPI('/users', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
    }) as any[];

    data = users.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      active: formatActiveStatus(user.active),
      created_at: formatDate(user.created_at),
      actions: [
        { label: 'Modifier', class: 'btn btn-warning' },
        { label: 'Supprimer', class: 'btn btn-error' }
      ]
    }));

    loadingUsers = false;
  });

  function handleAction(action: string, row: any) {
    if (action === 'Modifier') {
      openModal(row);
    } else if (action === 'Supprimer') {
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
      console.error('Erreur lors de la récupération des détails de l\'utilisateur : ', error);
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        location.reload();
      } else {
        notifications.error("Erreur lors de la suppression de l'utilisateur.");
      }
    } catch (error: any) {
      closeModals();
      notifications.error("Erreur");
    }
  }

  async function modifyUser() {
    try {
      const res = await fetchFromAPI(`/users/${editedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` },
        body: JSON.stringify(editedUser)
      });

      notifications.success("L'utilisateur a bien été modifié.");
      closeModals();
      await new Promise(resolve => setTimeout(resolve, 1000));
      location.reload();
    } catch (error: any) {
      closeModals();
      notifications.error("Erreur");
    }
  }

  // Clients
  let clientsData: any[] = [];
  let clientsColumns = [
    { Header: 'Nom', accessor: 'name', sortable: true },
    { Header: 'Email', accessor: 'email', sortable: true },
    { Header: 'Statut', accessor: 'onboarding', sortable: true },
    { Header: 'Date de création', accessor: 'created_at', sortable: true },
    { Header: 'Actions', accessor: 'actions', sortable: false }
  ];

  let selectedClient: any = null;
  let editedClient: any = { ...selectedClient };

  onMount(async () => {
    const clients = await fetchFromAPI('/clients', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
    }) as any[];

    clientsData = clients.map(client => ({
      id: client.id,
      name: `${client.user.first_name} ${client.user.last_name}`,
      email: client.user.email,
      onboarding: client.onboarding
        ? `<span class="badge badge-success">Validé</span>`
        : `<span class="badge badge-error">Non validé</span>`,
      created_at: formatDate(client.created_at),
      actions: [
        { label: 'Supprimer', class: 'btn btn-error' }
      ]
    }));

    loadingClients = false;
  });

  function handleClientAction(action: string, row: any) {
    if (action === 'Supprimer') {
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
        notifications.success("Le client a bien été supprimé.");
        closeModals();
        await new Promise(resolve => setTimeout(resolve, 1000));
        location.reload();
      } else {
        notifications.error("Erreur lors de la suppression du client.");
      }
    } catch (error: any) {
      closeModals();
      notifications.error("Erreur");
    }
  }

  // Delivery Persons

  const statusOptions = [
    { value: 'pending', label: 'En attente' },
    { value: 'approved', label: 'Validé' },
    { value: 'rejected', label: 'Rejeté' }
  ];

  let deliveryPersonsData: any[] = [];
  let deliveryPersonsColumns = [
    { Header: 'Nom', accessor: 'name', sortable: true },
    { Header: 'Email', accessor: 'email', sortable: true },
    { Header: 'Statut', accessor: 'status', sortable: true },
    { Header: 'Carte d\'identité', accessor: 'identity_card_document', sortable: false },
    { Header: 'Permis de conduire', accessor: 'driver_license_document', sortable: false },
    { Header: 'RIB', accessor: 'bank_account', sortable: false },
    { Header: 'Créé le', accessor: 'created_at', sortable: true },
    { Header: 'Actions', accessor: 'actions', sortable: false }
  ];

  let loadingDeliveryPersons = true;
  let selectedDelivery: any = null;
  let editedDelivery: any = {};
  let showModalDeliveryEdit = false;
  let showModalDeliveryDelete = false;

  onMount(async () => {
    const deliveryPersons = await fetchFromAPI('/delivery-persons', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
    }) as any[];

    deliveryPersonsData = deliveryPersons.map(dp => ({
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
        { label: 'Modifier', class: 'btn btn-warning' },
        { label: 'Supprimer', class: 'btn btn-error' }
      ]
    }));

    loadingDeliveryPersons = false;
  });

  function handleDeliveryAction(action: string, row: any) {
    if (action === 'Modifier') {
      selectedDelivery = row;
      editedDelivery = { ...row, status: row.raw_status || 'pending' };
      showModalDeliveryEdit = true;
    } else if (action === 'Supprimer') {
      selectedDelivery = row;
      showModalDeliveryDelete = true;
    }
  }

  // Commerçants

  const traderStatusList = ['pending', 'approved', 'rejected'];

  let tradersData: any[] = [];
  let tradersColumns = [
    { Header: 'Nom', accessor: 'name', sortable: true },
    { Header: 'Email', accessor: 'email', sortable: true },
    { Header: 'Statut', accessor: 'status', sortable: true },
    { Header: 'Carte d\'identité', accessor: 'identity_card_document', sortable: false },
    { Header: 'Justificatif d\'activité', accessor: 'proof_of_business_document', sortable: false },
    { Header: 'RIB', accessor: 'bank_account', sortable: false },
    { Header: 'Créé le', accessor: 'created_at', sortable: true },
    { Header: 'Actions', accessor: 'actions', sortable: false }
  ];

  let loadingTraders = true;
  let selectedTrader: any = null;
  let editedTrader: any = {};
  let showModalTraderEdit = false;
  let showModalTraderDelete = false;

  onMount(async () => {
    const traders = await fetchFromAPI('/traders', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
    }) as any[];

    tradersData = traders.map(trader => ({
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
        { label: 'Modifier', class: 'btn btn-warning' },
        { label: 'Supprimer', class: 'btn btn-error' }
      ]
    }));

    loadingTraders = false;
  });

  function handleTraderAction(action: string, row: any) {
    if (action === 'Modifier') {
      selectedTrader = row;
      editedTrader = { ...row, status: row.raw_status || 'pending' };
      showModalTraderEdit = true;
    } else if (action === 'Supprimer') {
      selectedTrader = row;
      showModalTraderDelete = true;
    }
  }

  async function modifyTrader() {
    try {
      const res = await fetchFromAPI(`/traders/${editedTrader.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` },
        body: JSON.stringify({ status: editedTrader.status })
      });

      notifications.success("Le statut du commerçant a bien été mis à jour.");
      closeModals();
      await new Promise(resolve => setTimeout(resolve, 1000));
      location.reload();
    } catch (error) {
      closeModals();
      notifications.error("Erreur");
    }
  }

  async function deleteTrader() {
    try {
      await fetchFromAPI(`/traders/${selectedTrader.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
      });

      notifications.success("Le commerçant a bien été supprimé.");
      closeModals();
      await new Promise(resolve => setTimeout(resolve, 1000));
      location.reload();
    } catch (error) {
      closeModals();
      notifications.error("Erreur");
    }
  }

  async function modifyDelivery() {
    try {
      const res = await fetchFromAPI(`/delivery-persons/${editedDelivery.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` },
        body: JSON.stringify({ status: editedDelivery.status })
      });

      notifications.success("Le statut du livreur a bien été mis à jour.");
      closeModals();
      await new Promise(resolve => setTimeout(resolve, 1000));
      location.reload();
    } catch (error) {
      closeModals();
      notifications.error("Erreur");
    }
  }

  async function deleteDelivery() {
    try {
      const res = await fetchFromAPI(`/delivery-persons/${selectedDelivery.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
      });

      if (res == null) {
        notifications.success("Le livreur a bien été supprimé.");
        closeModals();
        await new Promise(resolve => setTimeout(resolve, 1000));
        location.reload();
      } else {
        notifications.error("Erreur lors de la suppression.");
      }
    } catch (error) {
      closeModals();
      notifications.error("Erreur");
    }
  }

  let providersData: any[] = [];
  let loadingProviders = true;
  let selectedProvider: any = null;
  let editedProvider: any = {};
  let showModalProviderEdit = false;
  let showModalProviderDelete = false;

  let providersColumns = [
    { Header: 'Nom', accessor: 'name', sortable: true },
    { Header: 'Email', accessor: 'email', sortable: true },
    { Header: 'Statut', accessor: 'status', sortable: true },
    { Header: 'Carte d\'identité', accessor: 'identity_card_document', sortable: false },
    { Header: 'Justificatif d\'activité', accessor: 'proof_of_business_document', sortable: false },
    { Header: 'Documents de certification', accessor: 'certification_documents', sortable: false },
    { Header: 'RIB', accessor: 'bank_account', sortable: false },
    { Header: 'Créé le', accessor: 'created_at', sortable: true },
    { Header: 'Actions', accessor: 'actions', sortable: false }
  ];

  onMount(async () => {
    const providers = await fetchFromAPI('/providers', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
    }) as any[];

    providersData = providers.map(p => ({
      id: p.id,
      name: `${p.user?.first_name ?? 'Utilisateur'} ${p.user?.last_name ?? ''}`,
      email: p.user?.email ?? '',
      status: formatStatus(p.status),
      raw_status: p.status,
      identity_card_document: `<button class="btn btn-sm" onClick="window.open('${p.identity_card_document}', '_blank')">Voir</button>`,
      proof_of_business_document: `<button class="btn btn-sm" onClick="window.open('${p.proof_of_business_document}', '_blank')">Voir</button>`,
      certification_documents: p.certification_documents.map((url: string) =>
        `<button class="btn btn-xs mr-1 mb-1" onClick="window.open('${url}', '_blank')">Voir</button>`
      ).join(''),
      bank_account: p.bank_account,
      created_at: formatDate(p.created_at),
      actions: [
        { label: 'Modifier', class: 'btn btn-warning' },
        { label: 'Supprimer', class: 'btn btn-error' }
      ]
    }));

    loadingProviders = false;
  });

  function handleProviderAction(action: string, row: any) {
    if (action === 'Modifier') {
      selectedProvider = row;
      editedProvider = { ...row, status: row.raw_status || 'pending' };
      showModalProviderEdit = true;
    } else if (action === 'Supprimer') {
      selectedProvider = row;
      showModalProviderDelete = true;
    }
  }

  async function modifyProvider() {
    try {
      await fetchFromAPI(`/providers/${editedProvider.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` },
        body: JSON.stringify({ status: editedProvider.status })
      });

      notifications.success("Le statut du fournisseur a bien été mis à jour.");
      closeModals();
      await new Promise(resolve => setTimeout(resolve, 1000));
      location.reload();
    } catch (error) {
      closeModals();
      notifications.error("Erreur");
    }
  }

  async function deleteProvider() {
    try {
      await fetchFromAPI(`/providers/${selectedProvider.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
      });

      notifications.success("Le fournisseur a bien été supprimé.");
      closeModals();
      await new Promise(resolve => setTimeout(resolve, 1000));
      location.reload();
    } catch (error) {
      closeModals();
      notifications.error("Erreur");
    }
  }


</script>

<div class="p-6 min-h-screen">

<!-- Utilisateurs -->
<h1 class="text-2xl mt-10 mb-5 font-medium">Utilisateurs</h1>

{#if loadingUsers}
  <div class="fixed inset-0 flex items-center justify-center bg-white z-50">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
{:else}
  <Table {columns} {data} pageSize={5} onAction={handleAction} />
{/if}

<h1 class="text-2xl mt-10 mb-5 font-medium">Profiles</h1>

<!-- Clients -->
<h2 class="text-xl mt-5 mb-2 font-medium">Clients</h2>

{#if loadingClients}
  <div class="fixed inset-0 flex items-center justify-center bg-white z-50">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
{:else}
  <Table columns={clientsColumns} data={clientsData} pageSize={5} onAction={handleClientAction} />
{/if}

<h2 class="text-xl mt-5 mb-2 font-medium">Livreurs</h2>

<!-- Delivery Persons -->
{#if loadingDeliveryPersons}
  <div class="fixed inset-0 flex items-center justify-center bg-white z-50">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
{:else}
  <Table columns={deliveryPersonsColumns} data={deliveryPersonsData} pageSize={5} onAction={handleDeliveryAction} />
{/if}

<h2 class="text-xl mt-5 mb-2 font-medium">Commerçants</h2>

{#if loadingTraders}
  <div class="fixed inset-0 flex items-center justify-center bg-white z-50">
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
      <h2 class="text-center text-xl font-semibold mb-5">Modifier l'utilisateur</h2>
      {#if editedUser}
        <fieldset class="fieldset"><legend>Prénom</legend><input class="input input-bordered" bind:value={editedUser.first_name} /></fieldset>
        <fieldset class="fieldset"><legend>Nom</legend><input class="input input-bordered" bind:value={editedUser.last_name} /></fieldset>
        <fieldset class="fieldset"><legend>Email</legend><input class="input input-bordered" bind:value={editedUser.email} /></fieldset>
        <fieldset class="fieldset"><legend>Actif</legend><input type="checkbox" class="checkbox" checked={editedUser.active} on:change={() => editedUser.active = !editedUser.active} /></fieldset>
        <fieldset class="fieldset"><legend>Vérifié</legend><input type="checkbox" class="checkbox" checked={editedUser.verified} on:change={() => editedUser.verified = !editedUser.verified} /></fieldset>
        <fieldset class="fieldset"><legend>Administrateur</legend><input type="checkbox" class="checkbox" checked={editedUser.administrator} on:change={() => editedUser.administrator = !editedUser.administrator} /></fieldset>
      {/if}
      <div class="modal-action">
        <button class="btn btn-primary" on:click={modifyUser}>Enregistrer</button>
        <button class="btn" on:click={closeModals}>Fermer</button>
      </div>
    </div>
  </div>
{/if}

<!-- Modale suppression utilisateur -->
{#if showModalUserDelete}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="text-center text-xl font-semibold mb-5">Supprimer l'utilisateur</h2>
      {#if selectedUser}
        <p class="text-center">Êtes-vous sûr de vouloir supprimer <strong>{selectedUser.name}</strong> ?</p>
      {/if}
      <div class="modal-action">
        <button class="btn btn-error" on:click={deleteUser}>Supprimer</button>
        <button class="btn" on:click={closeModals}>Annuler</button>
      </div>
    </div>
  </div>
{/if}

<!-- Modale suppression client -->
{#if showModalClientDelete}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="text-center text-xl font-semibold mb-5">Supprimer le client</h2>
      {#if selectedClient}
        <p class="text-center">Êtes-vous sûr de vouloir supprimer <strong>{selectedClient.name}</strong> ?</p>
      {/if}
      <div class="modal-action">
        <button class="btn btn-error" on:click={deleteClient}>Supprimer</button>
        <button class="btn" on:click={closeModals}>Annuler</button>
      </div>
    </div>
  </div>
{/if}

{#if showModalDeliveryEdit}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="text-center text-xl font-semibold mb-5">Modifier le statut du livreur</h2>
      <label class="label" for="delivery-status">Statut</label>
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
        <button class="btn btn-primary" on:click={modifyDelivery}>Enregistrer</button>
        <button class="btn" on:click={closeModals}>Fermer</button>
      </div>
    </div>
  </div>
{/if}


{#if showModalDeliveryDelete}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="text-center text-xl font-semibold mb-5">Supprimer le livreur</h2>
      {#if selectedDelivery}
        <p class="text-center">Êtes-vous sûr de vouloir supprimer <strong>{selectedDelivery.name}</strong> ?</p>
      {/if}
      <div class="modal-action">
        <button class="btn btn-error" on:click={deleteDelivery}>Supprimer</button>
        <button class="btn" on:click={closeModals}>Annuler</button>
      </div>
    </div>
  </div>
{/if}

{#if showModalTraderEdit}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="text-center text-xl font-semibold mb-5">Modifier le statut du commerçant</h2>
      <label class="label" for="trader-status">Statut</label>
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
        <button class="btn btn-primary" on:click={modifyTrader}>Enregistrer</button>
        <button class="btn" on:click={closeModals}>Fermer</button>
      </div>
    </div>
  </div>
{/if}

{#if showModalTraderDelete}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="text-center text-xl font-semibold mb-5">Supprimer le commerçant</h2>
      {#if selectedTrader}
        <p class="text-center">Êtes-vous sûr de vouloir supprimer <strong>{selectedTrader.name}</strong> ?</p>
      {/if}
      <div class="modal-action">
        <button class="btn btn-error" on:click={deleteTrader}>Supprimer</button>
        <button class="btn" on:click={closeModals}>Annuler</button>
      </div>
    </div>
  </div>
{/if}

<h2 class="text-xl mt-5 mb-2 font-medium">Prestataire</h2>

{#if loadingProviders}
  <div class="fixed inset-0 flex items-center justify-center bg-white z-50">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
{:else}
  <Table columns={providersColumns} data={providersData} pageSize={5} onAction={handleProviderAction} />
{/if}

{#if showModalProviderEdit}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="text-center text-xl font-semibold mb-5">Modifier le statut du prestataire</h2>
      <label class="label" for="provider-status">Statut</label>
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
        <button class="btn btn-primary" on:click={modifyProvider}>Enregistrer</button>
        <button class="btn" on:click={closeModals}>Fermer</button>
      </div>
    </div>
  </div>
{/if}

{#if showModalProviderDelete}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="text-center text-xl font-semibold mb-5">Supprimer le fournisseur</h2>
      {#if selectedProvider}
        <p class="text-center">Êtes-vous sûr de vouloir supprimer <strong>{selectedProvider.name}</strong> ?</p>
      {/if}
      <div class="modal-action">
        <button class="btn btn-error" on:click={deleteProvider}>Supprimer</button>
        <button class="btn" on:click={closeModals}>Annuler</button>
      </div>
    </div>
  </div>
{/if}


</div>