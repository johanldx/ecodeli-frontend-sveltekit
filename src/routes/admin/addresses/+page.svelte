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
    public: boolean;
    price: number;
    created_at: string;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  };

  let loading = true;
  let privateAddresses: any[] = [];
  let publicAddresses: any[] = [];
  
  let privateColumns = [
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

  let publicColumns = [
    { Header: 'Nom utilisateur', accessor: 'user_name', sortable: true },
    { Header: 'Email', accessor: 'user_email', sortable: true },
    { Header: 'Nom adresse', accessor: 'name', sortable: true },
    { Header: 'Adresse', accessor: 'address', sortable: true },
    { Header: 'Code postal', accessor: 'cp', sortable: true },
    { Header: 'Ville', accessor: 'city', sortable: true },
    { Header: 'Pays', accessor: 'country', sortable: true },
    { Header: 'Prix', accessor: 'price', sortable: true },
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
    public: false,
    price: 0,
    created_at: '',
    user: { id: 0, first_name: '', last_name: '', email: '' }
  };
  let showModalEdit = false;
  let showModalDelete = false;
  let showModalCreate = false;

  // Variables pour l'autocomplétion d'adresse
  let suggestions: any[] = [];
  let showSuggestions = false;
  let addressValid = false;
  let manualConfirmInvalid = false;

  const formatDate = (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm');

  let newLocation = {
	userId: 0,
    name: '',
    address: '',
    cp: '',
    city: '',
    country: '',
    public: true, // Forcé à true
    price: 0,
  };

  async function searchAddressInField() {
    const query = newLocation.address;
    if (query.length < 3) {
      suggestions = [];
      showSuggestions = false;
      return;
    }

    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
    );
    const data = await res.json();
    suggestions = data.features;
    showSuggestions = true;
    addressValid = false;
    manualConfirmInvalid = false;
  }

  function selectSuggestion(s: any) {
    const p = s.properties;
    newLocation.address = p.name;
    newLocation.cp = p.postcode;
    newLocation.city = p.city;
    newLocation.country = 'France';
    addressValid = true;
    manualConfirmInvalid = true;
    showSuggestions = false;
  }

  async function loadAddresses() {
    try {
      const res = await fetchFromAPI<Address[]>('/locations', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
      });

      console.log('Données reçues :', res);

      // Séparer les adresses en deux tableaux
      const allAddresses = res.map((a) => ({
        ...a,
        user_name: `${a.user.first_name} ${a.user.last_name}`,
        user_email: a.user.email,
        created_at: formatDate(a.created_at),
        actions: [
          { label: 'Modifier', class: 'btn btn-warning' },
          { label: 'Supprimer', class: 'btn btn-error' }
        ]
      }));

      // Adresses privées (public = false)
      privateAddresses = allAddresses.filter(addr => !addr.public);
      
      // Adresses publiques (public = true, peu importe le prix)
      publicAddresses = allAddresses.filter(addr => addr.public);

      loading = false;
    } catch {
      notifications.error('Erreur lors du chargement des adresses.');
    }
  }

  onMount(loadAddresses);
  onMount(() => onDestroy(tabTitle('admin.addresses.tab_title')));

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
    showModalCreate = false;
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

  function openCreateModal() {
    showModalCreate = true;
    // Réinitialiser les variables d'autocomplétion
    suggestions = [];
    showSuggestions = false;
    addressValid = false;
    manualConfirmInvalid = false;
    // Réinitialiser newLocation avec public forcé à true
    newLocation = {
      userId: 0,
      name: '',
      address: '',
      cp: '',
      city: '',
      country: '',
      public: true, // Forcé à true
      price: 0,
    };
  }

  function closeCreateModal() {
    showModalCreate = false;
  }

  async function createLocation() {
    if (!newLocation.name) {
      notifications.error('Le nom de l\'adresse est obligatoire.');
      return;
    }

    if (newLocation.price < 0) {
      notifications.error('Le prix ne peut pas être négatif.');
      return;
    }

    if (!addressValid && !manualConfirmInvalid) {
      notifications.warning('Veuillez cocher la case pour confirmer une adresse non reconnue.');
      return;
    }

    try {
      await fetchFromAPI('/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${get(accessToken)}`
        },
        body: JSON.stringify(newLocation),
      });
      notifications.success('Nouvelle location créée.');
      closeCreateModal();
      location.reload();
    } catch {
      notifications.error('Erreur lors de la création de la location.');
    }
  }
</script>

<div class="p-6">
<div class="flex items-center justify-between mt-10 mb-5">
	<h1 class="text-2xl font-medium">Adresses</h1>
	<button class="btn btn-primary" on:click={openCreateModal}>Créer une nouvelle location</button>
</div>

  {#if loading}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
  {:else}
    <!-- Tableau des adresses privées -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold text-gray-800">Adresses privées</h2>
      {#if privateAddresses.length > 0}
        <Table columns={privateColumns} data={privateAddresses} pageSize={10} onAction={handleAction} />
      {:else}
        <div class="text-center py-8 text-gray-500">
          <p>Aucune adresse privée trouvée</p>
        </div>
      {/if}
    </div>

    <!-- Tableau des adresses publiques avec prix -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold text-gray-800">Adresses publiques</h2>
      {#if publicAddresses.length > 0}
        <Table columns={publicColumns} data={publicAddresses} pageSize={10} onAction={handleAction} />
      {:else}
        <div class="text-center py-8 text-gray-500">
          <p>Aucune adresse publique trouvée</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Bouton pour ouvrir la modale de création -->

  <!-- Modale Création -->
  {#if showModalCreate}
    <div class="modal modal-open">
      <div class="modal-box relative w-full max-w-2xl">
        <h2 class="mb-4 text-center text-xl font-semibold">Créer une nouvelle location</h2>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input 
            class="input input-bordered w-full" 
            bind:value={newLocation.name} 
            placeholder="Nom" 
          />

          <div class="relative">
            <input 
              class="input input-bordered w-full" 
              bind:value={newLocation.address} 
              placeholder="Adresse" 
              on:input={searchAddressInField}
            />
            {#if Array.isArray(suggestions) && showSuggestions && suggestions.length > 0}
              <ul class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded border border-gray-300 bg-white shadow">
                {#each suggestions as suggestion}
                  <button
                    type="button"
                    class="hover:bg-base-200 w-full cursor-pointer px-4 py-2 text-left text-sm"
                    on:click={() => selectSuggestion(suggestion)}
                  >
                    {suggestion.properties.label}
                  </button>
                {/each}
              </ul>
            {/if}
          </div>

          <input 
            class="input input-bordered w-full" 
            bind:value={newLocation.cp} 
            placeholder="Code postal" 
          />
          <input 
            class="input input-bordered w-full" 
            bind:value={newLocation.city} 
            placeholder="Ville" 
          />
          <input 
            class="input input-bordered w-full" 
            bind:value={newLocation.country} 
            placeholder="Pays" 
          />
          <input
            class="input input-bordered w-full"
            type="number"
            min="0"
            bind:value={newLocation.price}
            placeholder="Prix"
          />
        </div>

        <!-- Champ Public forcé à true -->
        <div class="form-control mt-4">
          <label class="label cursor-pointer">
            <span class="label-text">Public (obligatoire)</span>
            <input 
              type="checkbox" 
              class="toggle toggle-primary" 
              bind:checked={newLocation.public} 
              disabled 
            />
          </label>
        </div>

        {#if !addressValid}
          <div class="form-control mt-4">
            <label class="label cursor-pointer gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-warning"
                bind:checked={manualConfirmInvalid}
              />
              <span class="label-text text-sm text-gray-600">
                Je confirme que cette adresse est correcte même si elle n'a pas été reconnue
                automatiquement.
              </span>
            </label>
          </div>
        {/if}

        <div class="modal-action">
          <button class="btn btn-primary" on:click={createLocation}>Créer</button>
          <button class="btn" on:click={closeCreateModal}>Annuler</button>
        </div>
      </div>
      <button
        type="button"
        class="modal-backdrop"
        aria-label="Close modal"
        on:click={closeCreateModal}
        on:keydown={(e) => e.key === 'Enter' && closeCreateModal()}
      ></button>
    </div>
  {/if}

  <!-- Modale Édition -->
  {#if showModalEdit}
    <div class="modal modal-open">
      <div class="modal-box">
        <h2 class="mb-4 text-center text-xl font-semibold">Modifier l'adresse</h2>
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
        <h2 class="mb-4 text-center text-xl font-semibold">Supprimer l'adresse</h2>
        {#if selectedAddress}
          <p class="text-center">
            Confirmez-vous la suppression de l'adresse <strong>{selectedAddress.name}</strong> ?
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
