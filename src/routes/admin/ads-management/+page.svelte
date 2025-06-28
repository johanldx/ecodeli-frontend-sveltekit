<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import Table from '$lib/components/Table.svelte';
  import { fetchFromAPI } from '$lib/utils/api';
  import { accessToken } from '$lib/stores/token';
  import { notifications } from '$lib/stores/notifications';
  import dayjs from 'dayjs';
  import { tabTitle } from '$lib/utils/tabTitle';

  const adTypes = [
    { key: 'release-cart-ads', label: 'Lacher de chariot' },
    { key: 'delivery-ads', label: 'Livraisons' },
    { key: 'shopping-ads', label: 'Courses' },
    { key: 'personal-service-ads', label: 'Services à la personne' }
  ];

  let selectedType = adTypes[0].key;
  let loading = true;
  let data: any[] = [];
  let columns: any[] = [];
  let showEditModal = false;
  let showDeleteModal = false;
  let editedAd: any = {};
  let selectedAd: any = null;

  function formatDate(date: string) {
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  }

  async function loadAds() {
    loading = true;
    try {
      const res = await fetchFromAPI<any[]>(`/${selectedType}`, {
        headers: { Authorization: `Bearer ${get(accessToken)}` }
      });
      data = res.map((ad) => ({
        ...ad,
        created_at: formatDate(ad.created_at),
        actions: [
          { label: 'Modifier', class: 'btn btn-warning' },
          ...(ad.status === 'pending' ? [{ label: 'Supprimer', class: 'btn btn-error' }] : [])
        ]
      }));
      columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Titre', accessor: 'title', sortable: true },
        { Header: 'Statut', accessor: 'status', sortable: true },
        { Header: 'Créé le', accessor: 'created_at', sortable: true },
        { Header: 'Actions', accessor: 'actions', sortable: false }
      ];
      loading = false;
    } catch {
      notifications.error('Erreur lors du chargement des annonces.');
      loading = false;
    }
  }

  function handleAction(action: string, row: any) {
    if (action === 'Modifier') {
      editedAd = { ...row };
      showEditModal = true;
    } else if (action === 'Supprimer') {
      selectedAd = row;
      showDeleteModal = true;
    }
  }

  async function saveAd() {
    try {
      await fetchFromAPI(`/${selectedType}/${editedAd.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` },
        body: JSON.stringify(editedAd)
      });
      notifications.success('Annonce modifiée.');
      showEditModal = false;
      await loadAds();
    } catch {
      notifications.error("Erreur lors de l'enregistrement.");
    }
  }

  async function deleteAd() {
    if (!selectedAd) return;
    try {
      await fetchFromAPI(`/${selectedType}/${selectedAd.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${get(accessToken)}` }
      });
      notifications.success('Annonce supprimée.');
      showDeleteModal = false;
      await loadAds();
    } catch {
      notifications.error('Erreur lors de la suppression.');
    }
  }

  onMount(() => {
    tabTitle('admin.ads-management.tab_title');
    loadAds();
  });

  $: if (selectedType) loadAds();
</script>

<div class="p-6">
  <div class="flex items-center gap-4 mb-6">
    {#each adTypes as type}
      <button
        class="btn btn-sm px-4 py-2 rounded {selectedType === type.key ? 'btn-primary' : 'btn-ghost'}"
        on:click={() => { selectedType = type.key; }}
      >
        {type.label}
      </button>
    {/each}
  </div>

  {#if loading}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
  {:else}
    <Table {columns} {data} pageSize={10} onAction={handleAction} />
  {/if}

  <!-- Modale édition -->
  {#if showEditModal}
    <div class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h2 class="mb-4 text-center text-xl font-semibold">Modifier l'annonce</h2>
        <form on:submit|preventDefault={saveAd} class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Titre</label>
              <input class="input input-bordered w-full" bind:value={editedAd.title} placeholder="Titre" required />
            </div>
            <div>
              <label class="label">Statut</label>
              <select class="input input-bordered w-full" bind:value={editedAd.status} required>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            {#if selectedType === 'release-cart-ads' || selectedType === 'delivery-ads' || selectedType === 'shopping-ads'}
              <div>
                <label class="label">Taille du colis</label>
                <select class="input input-bordered w-full" bind:value={editedAd.packageSize} required>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
            {/if}
            {#if selectedType === 'release-cart-ads'}
              <div>
                <label class="label">Email client</label>
                <input class="input input-bordered w-full" bind:value={editedAd.clientEmail} placeholder="Email client" type="email" />
              </div>
            {/if}
            {#if selectedType === 'release-cart-ads' || selectedType === 'delivery-ads'}
              <div>
                <label class="label">Référence</label>
                <input class="input input-bordered w-full" bind:value={editedAd.reference} placeholder="Référence" />
              </div>
            {/if}
            {#if selectedType === 'release-cart-ads' || selectedType === 'shopping-ads'}
              <div>
                <label class="label">Prix (€)</label>
                <input class="input input-bordered w-full" bind:value={editedAd.price} type="number" min="0" step="0.01" placeholder="Prix" />
              </div>
            {/if}
            {#if selectedType === 'personal-service-ads'}
              <div>
                <label class="label">Type de service</label>
                <input class="input input-bordered w-full" value={editedAd.type?.name ?? ''} placeholder="Type de service" disabled />
              </div>
            {/if}
          </div>
          <div>
            <label class="label">Description</label>
            <textarea class="textarea textarea-bordered w-full" bind:value={editedAd.description} rows="3" placeholder="Description"></textarea>
          </div>
          {#if selectedType === 'shopping-ads'}
            <div>
              <label class="label">Liste de courses (1 par ligne)</label>
              <textarea class="textarea textarea-bordered w-full" bind:value={editedAd.shoppingListStr} rows="3" placeholder="Pain\nLait\nFruits"></textarea>
            </div>
          {/if}
          <div class="modal-action">
            <button class="btn btn-primary" type="submit">Enregistrer</button>
            <button class="btn" type="button" on:click={() => (showEditModal = false)}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Modale suppression -->
  {#if showDeleteModal}
    <div class="modal modal-open">
      <div class="modal-box">
        <h2 class="mb-4 text-center text-xl font-semibold">Supprimer l'annonce</h2>
        {#if selectedAd}
          <p class="text-center">
            Confirmez-vous la suppression de l'annonce <strong>{selectedAd.title}</strong> ?
          </p>
        {/if}
        <div class="modal-action">
          <button class="btn btn-error" on:click={deleteAd}>Supprimer</button>
          <button class="btn" on:click={() => (showDeleteModal = false)}>Annuler</button>
        </div>
      </div>
    </div>
  {/if}
</div> 