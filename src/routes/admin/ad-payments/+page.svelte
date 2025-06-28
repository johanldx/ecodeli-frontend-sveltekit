<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import Table from '$lib/components/Table.svelte';
  import { fetchFromAPI } from '$lib/utils/api';
  import { accessToken } from '$lib/stores/token';
  import { notifications } from '$lib/stores/notifications';
  import dayjs from 'dayjs';
  import { tabTitle } from '$lib/utils/tabTitle';

  let loading = true;
  let data: any[] = [];
  let columns = [
    { Header: 'ID', accessor: 'id', sortable: true },
    { Header: 'Utilisateur', accessor: 'user_email', sortable: true },
    { Header: 'Montant', accessor: 'amount', sortable: true },
    { Header: 'Type', accessor: 'payment_type', sortable: true },
    { Header: 'Statut', accessor: 'status', sortable: true },
    { Header: 'Date', accessor: 'created_at', sortable: true },
    { Header: 'Référence', accessor: 'reference_id', sortable: true }
  ];

  const formatDate = (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm');

  async function loadPayments() {
    try {
      const res = await fetchFromAPI<any[]>('/ad-payments/admin', {
        headers: { Authorization: `Bearer ${get(accessToken)}` }
      });
      data = res.map((p) => ({
        ...p,
        user_email: p.user?.email ?? '—',
        created_at: formatDate(p.created_at)
      }));
      loading = false;
    } catch {
      notifications.error('Erreur lors du chargement des paiements.');
    }
  }

  function onAction() {}

  onMount(loadPayments);
  onMount(() => onDestroy(tabTitle('admin.ad-payments.tab_title')));
</script>

<div class="p-6">
  <div class="flex items-center justify-between mt-10 mb-5">
    <h1 class="text-2xl font-medium">Paiements</h1>
  </div>

  {#if loading}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
  {:else}
    <Table {columns} {data} pageSize={10} {onAction} />
  {/if}
</div>