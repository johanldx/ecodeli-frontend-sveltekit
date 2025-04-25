<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { fetchFromAPI } from '$lib/utils/api';
  import { accessToken } from '$lib/stores/token';
  import { notifications } from '$lib/stores/notifications';
  import { t } from '$lib/utils/t';

  import { onDestroy} from 'svelte';
	import { tabTitle } from '$lib/utils/tabTitle';

onMount(() => onDestroy(tabTitle('app.providers.addresses')));

  type Address = {
    id: number;
    userId: number;
    name: string;
    address: string;
    cp: string;
    city: string;
    country: string;
  };

  let addresses: Address[] = [];
  let modalVisible = false;
  let modalType: 'add' | 'edit' = 'add';
  let deleteModalVisible = false;
  let addressToDelete: Address | null = null;
  let selectedAddress: Address = { id: 0, userId: 0, name: '', address: '', cp: '', city: '', country: 'France' };

  let suggestions: any[] = [];
  let showSuggestions = false;
  let addressValid = false;
  let manualConfirmInvalid = false;

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${get(accessToken)}`
  });

  const title = t('app.delivery.addresses.title');
const nameLabel = t('app.delivery.addresses.name');
const addressLabel = t('app.delivery.addresses.address');
const postal_code = t('app.delivery.addresses.postal_code');
const cityLabel = t('app.delivery.addresses.city');
const countryLabel = t('app.delivery.addresses.country');
const add_address = t('app.delivery.addresses.add_address');
const modify = t('app.delivery.addresses.modify');
const delete_address = t('app.delivery.addresses.delete_address');

  async function searchAddressInField() {
    const query = selectedAddress.address;
    if (query.length < 3) {
      suggestions = [];
      showSuggestions = false;
      return;
    }

    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
    const data = await res.json();
    suggestions = data.features;
    showSuggestions = true;
    addressValid = false;
    manualConfirmInvalid = false;
  }

  function selectSuggestion(s: any) {
    const p = s.properties;
    selectedAddress.address = p.name + (p.street ? ' ' + p.street : '');
    selectedAddress.cp = p.postcode;
    selectedAddress.city = p.city;
    selectedAddress.country = 'France';
    addressValid = true;
    manualConfirmInvalid = true;
    showSuggestions = false;
  }

  onMount(loadAddresses);

  async function loadAddresses() {
    try {
      const res = await fetchFromAPI<Address[]>('/locations', { headers: getHeaders() });
      addresses = res;
    } catch {
      notifications.error('Impossible de charger les adresses.');
    }
  }

  function openAddModal() {
    modalType = 'add';
    selectedAddress = { id: 0, userId: 0, name: '', address: '', cp: '', city: '', country: 'France' };
    suggestions = [];
    showSuggestions = false;
    addressValid = false;
    manualConfirmInvalid = false;
    modalVisible = true;
  }

  function openEditModal(addr: Address) {
    modalType = 'edit';
    selectedAddress = { ...addr };
    suggestions = [];
    showSuggestions = false;
    addressValid = true;
    manualConfirmInvalid = true;
    modalVisible = true;
  }

  function openDeleteModal(addr: Address) {
    addressToDelete = addr;
    deleteModalVisible = true;
  }

  async function confirmDelete() {
    if (!addressToDelete) return;
    try {
      await fetchFromAPI(`/locations/${addressToDelete.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      addresses = addresses.filter(a => a.id !== addressToDelete!.id);
      notifications.success('Adresse supprimée avec succès.');
    } catch {
      notifications.error("Erreur lors de la suppression.");
    } finally {
      deleteModalVisible = false;
      addressToDelete = null;
    }
  }

  async function saveAddress() {
    if (!selectedAddress.name) {
      notifications.warning("Le nom de l'adresse est obligatoire.");
      return;
    }

    if (!addressValid && !manualConfirmInvalid) {
      notifications.warning("Veuillez cocher la case pour confirmer une adresse non reconnue.");
      return;
    }

    const url = modalType === 'add' ? '/locations' : `/locations/${selectedAddress.id}`;
    const method = modalType === 'add' ? 'POST' : 'PATCH';

    try {
      await fetchFromAPI(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(selectedAddress)
      });

      await loadAddresses();
      notifications.success(modalType === 'add' ? 'Adresse ajoutée.' : 'Adresse mise à jour.');
      modalVisible = false;
    } catch {
      notifications.error("Erreur lors de l'enregistrement.");
    }
  }

  function closeModal() {
    modalVisible = false;
    deleteModalVisible = false;
  }
</script>

<!-- Page -->
<div class="p-6 bg-[#FEFCF3] min-h-screen">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-author text-gray-800">{$title}</h1>
    <button on:click={openAddModal} class="btn btn-secondary">{$add_address}</button>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each addresses as addr}
      <div class="card bg-white border border-gray-200 shadow-md">
        <div class="card-body">
          <h2 class="card-title text-lg">{addr.name}</h2>
          <p class="text-sm text-gray-700">{addr.address}</p>
          <p class="text-sm text-gray-700">{addr.cp} {addr.city}, {addr.country}</p>
          <div class="card-actions justify-end mt-4">
            <button class="btn btn-sm btn-primary" on:click={() => openEditModal(addr)}>{$modify}</button>
            <button class="btn btn-sm btn-error" on:click={() => openDeleteModal(addr)}>{$delete_address}</button>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Modale Ajout/Modif -->
  {#if modalVisible}
    <div class="modal modal-open">
      <div class="modal-box w-full max-w-2xl relative">
        <h3 class="font-bold text-lg mb-4">{modalType === 'add' ? 'Ajouter une adresse' : 'Modifier l’adresse'}</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input class="input input-bordered w-full" placeholder={$nameLabel} bind:value={selectedAddress.name} />

          <div class="relative">
            <input
              class="input input-bordered w-full"
              placeholder={$addressLabel}
              bind:value={selectedAddress.address}
              on:input={searchAddressInField}
            />
            {#if Array.isArray(suggestions) && showSuggestions && suggestions.length > 0}
              <ul class="absolute mt-1 w-full border border-gray-300 bg-white z-50 rounded shadow max-h-60 overflow-auto">
                {#each suggestions as suggestion}
                  <button
                    type="button"
                    class="px-4 py-2 text-sm hover:bg-base-200 cursor-pointer text-left w-full"
                    on:click={() => selectSuggestion(suggestion)}
                  >
                    {suggestion.properties.label}
                  </button>
                {/each}
              </ul>
            {/if}
          </div>

          <input class="input input-bordered w-full" placeholder={$postal_code} bind:value={selectedAddress.cp} />
          <input class="input input-bordered w-full" placeholder={$cityLabel} bind:value={selectedAddress.city} />
          <input class="input input-bordered w-full" placeholder={$countryLabel} bind:value={selectedAddress.country} />
        </div>

        {#if !addressValid}
          <div class="form-control mt-4">
            <label class="label cursor-pointer gap-2">
              <input type="checkbox" class="checkbox checkbox-warning" bind:checked={manualConfirmInvalid} />
              <span class="label-text text-sm text-gray-600">
                Je confirme que cette adresse est correcte même si elle n’a pas été reconnue automatiquement.
              </span>
            </label>
          </div>
        {/if}

        <div class="modal-action">
          <button class="btn" on:click={closeModal}>Annuler</button>
          <button class="btn btn-primary" on:click={saveAddress}>
            {modalType === 'add' ? 'Ajouter' : 'Mettre à jour'}
          </button>
        </div>
      </div>
      <button
        type="button"
        class="modal-backdrop"
        aria-label="Close modal"
        on:click={closeModal}
        on:keydown={(e) => e.key === 'Enter' && closeModal()}
      ></button>
    </div>
  {/if}

  <!-- Modale suppression -->
  {#if deleteModalVisible}
    <div class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Confirmer la suppression</h3>
        <p class="py-4">Êtes-vous sûr de vouloir supprimer cette adresse ?</p>
        <div class="modal-action">
          <button class="btn" on:click={closeModal}>Annuler</button>
          <button class="btn btn-error" on:click={confirmDelete}>Supprimer</button>
        </div>
      </div>
      <button
        type="button"
        class="modal-backdrop"
        aria-label="Close modal"
        on:click={closeModal}
        on:keydown={(e) => e.key === 'Enter' && closeModal()}
      ></button>
    </div>
  {/if}
</div>
