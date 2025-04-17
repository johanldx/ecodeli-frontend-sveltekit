<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { t, tStatic } from '$lib/utils/t';

  export let columns: { Header: string, accessor: string, sortable?: boolean, hidden?: boolean }[] = [];
  export let data: any[] = []; // Assurez-vous que `data` est correctement initialisé avant d'être utilisé
  export let pageSize: number = 5;
  export let onAction: (action: string, row: any) => void; // Event for button actions

  // constantes des traductions
  const next = t('admin.users.next');
  const previous = t('admin.users.previous');
  const page = t('admin.users.page');
  const on = tStatic('admin.users.on');

  // Pagination
  let currentPage = 0;
  let totalPages = Math.ceil(data.length / pageSize);
  let currentData: any[] = [];

  // Recherche
  let searchQuery = '';

  // Tri
  let sortColumn: string | null = null;
  let sortOrder: 'asc' | 'desc' = 'asc';

  // Dispatcher pour gérer les événements
  const dispatch = createEventDispatcher();

  // Filtrer les données en fonction de la recherche
  function filterData() {
    // Si la recherche est vide, retourner toutes les données
    if (searchQuery === '') {
      return data;
    }

    return data.filter(row =>
      columns.some(col =>
        String(row[col.accessor]).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }

  // Mettre à jour la page actuelle
  function updatePage(page: number) {
    // Si la page est hors des limites, réinitialiser à la première page
    if (page < 0) {
      currentPage = 0;
    } else if (page >= totalPages) {
      currentPage = totalPages - 1;
    } else {
      currentPage = page;
    }
    updateCurrentData();
  }

  // Mettre à jour les données de la page actuelle
  function updateCurrentData() {
    const filteredData = filterData();  // Obtenir les données filtrées
    totalPages = Math.ceil(filteredData.length / pageSize);  // Mettre à jour le nombre total de pages
    currentData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);  // Sélectionner les données de la page actuelle
  }

  // Tri des données par colonne
  function sortData(column: string) {
    if (sortColumn === column) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; // Inverse l'ordre du tri si la même colonne
    } else {
      sortColumn = column;
      sortOrder = 'asc'; // Définit l'ordre croissant par défaut
    }

    // Trier les données
    const filteredData = filterData();
    filteredData.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Mise à jour de la page après le tri
    totalPages = Math.ceil(filteredData.length / pageSize);
    currentData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  }

  // Lors du montage, mettre à jour les données de la page initiale
  onMount(() => {
    updateCurrentData();
  });
</script>

<div class="overflow-x-auto">
  <!-- Recherche -->
  <div class="my-4">
    <input
      type="text"
      class="input input-bordered md:w-1/2 w-full"
      placeholder="Rechercher..."
      bind:value={searchQuery}
      on:input={() => { currentPage = 0; updateCurrentData(); }} />
  </div>

  <!-- Table -->
  <table class="table table-striped table-zebra w-full">
    <thead>
      <tr>
        {#each columns as column}
          {#if !column.hidden}
            <th
              class="cursor-pointer"
              on:click={() => column.sortable !== false && sortData(column.accessor)}
            >
              {column.Header}
              {#if sortColumn === column.accessor}
                {#if sortOrder === 'asc'}
                  <span>&#9650;</span> <!-- Flèche ascendante -->
                {:else}
                  <span>&#9660;</span> <!-- Flèche descendante -->
                {/if}
              {/if}
            </th>
          {/if}
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each currentData as row}
        <tr>
          {#each columns as column}
            {#if !column.hidden}
              <td>
                {#if column.accessor === 'actions'}
                  <div class="flex space-x-2">
                    {#each row[column.accessor] as action}
                      <button
                        class={action.class || 'btn btn-xs btn-primary'}
                        on:click={() => onAction(action.label, row)}
                      >
                        {action.label}
                      </button>
                    {/each}
                  </div>
                {:else}
                  {@html row[column.accessor]}
                {/if}
              </td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <!-- Pagination -->
  <div class="flex justify-between items-center mt-4">
    <button
      class="btn btn-primary btn-sm"
      on:click={() => updatePage(currentPage - 1)}
      disabled={currentPage === 0}
    >
      {$previous}
    </button>

    <span>
      {$page} {currentPage + 1} ${on} {totalPages}
    </span>

    <button
      class="btn btn-primary btn-sm"
      on:click={() => updatePage(currentPage + 1)}
      disabled={currentPage === totalPages - 1}
    >
      {$next}
    </button>
  </div>
</div>