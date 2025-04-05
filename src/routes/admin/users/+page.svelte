<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchFromAPI } from '$lib/utils/api';
  import Table from '$lib/components/Table.svelte';
  import dayjs from 'dayjs';
  import { get } from 'svelte/store';
  import { accessToken } from '$lib/stores/token';
  import { notifications } from '$lib/stores/notifications';

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
  let showModalEdit = false;
  let showModalDelete = false;
  let selectedUser: any = null;
  let editedUser = { ...selectedUser };

  const formatActiveStatus = (status: boolean) => {
    return status
      ? `<span class="badge badge-success">Actif</span>`
      : `<span class="badge badge-error">Inactif</span>`;
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  onMount(async () => {
    const users = await fetchFromAPI('/users', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
    }) as {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      active: boolean;
      created_at: string;
    }[];

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
      showModalDelete = true;
    }
  }

  function openModal(user: any) {
    selectedUser = user;
    editedUser = { ...user };
    fetchUserDetails(selectedUser.id);
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
    showModalDelete = false;
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

  let clientsData: any[] = [];
  let clientsColumns = [
    { Header: 'Nom', accessor: 'name', sortable: true },
    { Header: 'Email', accessor: 'email', sortable: true },
    { Header: 'Onboarding', accessor: 'onboarding', sortable: true },
    { Header: 'Actions', accessor: 'actions', sortable: false }
  ];

  let showModalClientEdit = false;
  let selectedClient: any = null;
  let editedClient: any = { ...selectedClient };

  onMount(async () => {
    const clients = await fetchFromAPI('/clients', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
    }) as {
      id: string;
      user: { first_name: string; last_name: string };
      email: string;
      onboarding: boolean;
    }[];

    console.log(clientsData);

    clientsData = clients.map(client => ({
      id: client.id,
      name: `${client.user.first_name} ${client.user.last_name}`,
      email: client.email,
      onboarding: client.onboarding ? 'Validé' : 'Non validé',
      actions: [
        { label: 'Modifier', class: 'btn btn-warning' },
        { label: 'Supprimer', class: 'btn btn-error' }
      ]
    }));

    loadingClients = false;
  });

  function handleClientAction(action: string, row: any) {
    if (action === 'Modifier') {
      openClientModal(row);
    } else if (action === 'Supprimer') {
      selectedClient = row;
      showModalDelete = true;
    }
  }

  function openClientModal(client: any) {
    selectedClient = client;
    editedClient = { ...client };
    showModalClientEdit = true;
  }

  async function modifyClient() {
    try {
      const res = await fetchFromAPI(`/clients/${editedClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` },
        body: JSON.stringify({ onboarding: editedClient.onboarding === 'Validé' ? false : true })
      });

      notifications.success("Le client a bien été modifié.");
      closeModals();
      await new Promise(resolve => setTimeout(resolve, 1000));
      location.reload();
    } catch (error: any) {
      closeModals();
      notifications.error("Erreur lors de la modification du client.");
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
</script>

<h1 class="text-2xl mt-10 mb-5 font-medium">Liste des utilisateurs</h1>

{#if loadingUsers}
  <div class="fixed inset-0 flex items-center justify-center bg-white z-50">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
{:else}
  <Table {columns} {data} pageSize={5} onAction={handleAction} />
{/if}

<h2 class="text-xl mt-5 mb-2 font-medium">Clients</h2>

{#if loadingClients}
  <div class="fixed inset-0 flex items-center justify-center bg-white z-50">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
{:else}
  <Table columns={clientsColumns} data={clientsData} pageSize={5} onAction={handleClientAction} />
{/if}

{#if showModalEdit}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="text-center text-xl font-semibold mb-5">Modifier l'utilisateur</h2>

      {#if editedUser}
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Prénom</legend>
          <input type="text" class="input input-bordered" placeholder="Prénom" bind:value={editedUser.first_name} />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Nom</legend>
          <input type="text" class="input input-bordered" placeholder="Nom" bind:value={editedUser.last_name} />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Email</legend>
          <input type="email" class="input input-bordered" placeholder="Email" bind:value={editedUser.email} />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Actif</legend>
          <input type="checkbox" class="checkbox" checked={editedUser.active} on:change={() => editedUser.active = !editedUser.active} />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Vérifié</legend>
          <input type="checkbox" class="checkbox" checked={editedUser.verified} on:change={() => editedUser.verified = !editedUser.verified} />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Administrateur</legend>
          <input type="checkbox" class="checkbox" checked={editedUser.administrator} on:change={() => editedUser.administrator = !editedUser.administrator} />
        </fieldset>
      {/if}

      <div class="modal-action">
        <button class="btn btn-primary" on:click={modifyUser}>Enregistrer</button>
        <button class="btn" on:click={closeModals}>Fermer</button>
      </div>
    </div>
  </div>
{/if}

{#if showModalDelete}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="text-center text-xl font-semibold mb-5">Supprimer l'utilisateur</h2>
      {#if selectedUser}
        <p class="text-center">Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser.name}</strong> ?</p>
      {/if}
      <div class="modal-action">
        <button class="btn btn-error" on:click={deleteUser}>Supprimer</button>
        <button class="btn" on:click={closeModals}>Annuler</button>
      </div>
    </div>
  </div>
{/if}

{#if showModalDelete}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="text-center text-xl font-semibold mb-5">Supprimer le client</h2>
      {#if selectedClient}
        <p class="text-center">Êtes-vous sûr de vouloir supprimer le client <strong>{selectedClient.name}</strong> ?</p>
      {/if}
      <div class="modal-action">
        <button class="btn btn-error" on:click={deleteClient}>Supprimer</button>
        <button class="btn" on:click={closeModals}>Annuler</button>
      </div>
    </div>
  </div>
{/if}