<script lang="ts">
    import { onMount } from 'svelte';
    import { fetchFromAPI } from '$lib/utils/api';
    import Table from '$lib/components/Table.svelte';
    import dayjs from 'dayjs';
    import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
  
    // Données à afficher dans le tableau
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
  
    // Variable d'état de chargement
    let loading = true;
  
    // Modale d'édition et de suppression
    let showModalEdit = false;
    let showModalDelete = false;
  
    // Utilisateur sélectionné pour la modification ou la suppression
    let selectedUser: any = null;
  
    // Fonction pour afficher un badge "Actif" ou "Inactif"
    const formatActiveStatus = (status: boolean) => {
      return status
        ? `<span class="badge badge-success">Actif</span>`
        : `<span class="badge badge-error">Inactif</span>`;
    };
  
    // Formater la date avec dayjs
    const formatDate = (dateString: string) => {
      return dayjs(dateString).format('DD/MM/YYYY HH:mm'); // Formater comme "jour/mois/année heure:minute"
    };
  
    // Récupérer les utilisateurs depuis l'API
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
  
      console.log(users);
  
      // Traiter les données reçues et les formater
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
  
      // Mettre à jour l'état de chargement
      loading = false;
    });
  
    // Fonction de gestion des actions
    function handleAction(action: string, row: any) {
      if (action === 'Modifier') {
        selectedUser = row;
        showModalEdit = true;
      } else if (action === 'Supprimer') {
        selectedUser = row;
        showModalDelete = true;
      }
    }
  
    // Fonction pour fermer les modales
    function closeModals() {
      showModalEdit = false;
      showModalDelete = false;
    }
  
    // Fonction de suppression de l'utilisateur
    function deleteUser() {
      console.log(`Suppression de l'utilisateur ${selectedUser.name}`);
      // Ajouter ici la logique pour supprimer l'utilisateur
      closeModals(); // Fermer la modale après suppression
    }
  
    // Fonction de modification de l'utilisateur
    function modifyUser() {
      console.log(`Modification de l'utilisateur ${selectedUser.name}`);
      // Ajouter ici la logique pour modifier l'utilisateur
      closeModals(); // Fermer la modale après modification
    }
  </script>
  
  <h1 class="text-2xl mt-10 mb-5 font-medium">Liste des utilisateurs</h1>
  
  {#if loading}
    <div class="fixed inset-0 flex items-center justify-center bg-white z-50">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
  {:else}
    <!-- Table avec les données -->
    <Table {columns} {data} pageSize={5} onAction={handleAction} />
  {/if}

  <h1 class="text-2xl mt-10 mb-5 font-medium">Profiles</h1>

  <h2 class="text-xl mt-5 mb-2 font-medium">Clients</h2>
  <h2 class="text-xl mt-5 mb-2 font-medium">Livreurs</h2>
  <h2 class="text-xl mt-5 mb-2 font-medium">Commerçants</h2>
  <h2 class="text-xl mt-5 mb-2 font-medium">Préstataires</h2>

  
  <!-- Modale pour Modifier un utilisateur -->
  {#if showModalEdit}
    <div class="modal modal-open">
      <div class="modal-box">
        <h2>Modifier l'utilisateur</h2>
        {#if selectedUser}
          <p><strong>Nom :</strong> {selectedUser.name}</p>
          <p><strong>Email :</strong> {selectedUser.email}</p>
          <p><strong>Statut :</strong> {@html selectedUser.active}</p>
          <p><strong>Date de création :</strong> {selectedUser.created_at}</p>
        {/if}
        <div class="modal-action">
          <button class="btn" on:click={modifyUser}>Enregistrer</button>
          <button class="btn" on:click={closeModals}>Fermer</button>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Modale pour Supprimer un utilisateur -->
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
  