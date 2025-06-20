<script lang="ts">
import { tabTitle } from '$lib/utils/tabTitle';
import { onMount, onDestroy } from 'svelte';
import { fetchFromAPI } from '$lib/utils/api';
import { notifications } from '$lib/stores/notifications';
import { accessToken } from '$lib/stores/token';
import { get } from 'svelte/store';

let invoices: any[] = [];
let loading = true;
let generatingAll = false;
let showModal = false;
let selectedProvider: { id: number; name?: string } | null = null;
let generatingForProvider = false;
let showProviderModal = false;
let providerInputId: string = '';
let generatingProviderInput = false;
let showGenerateAllModal = false;
let showGenerateProviderModal = false;
let selectedProviderId: number | null = null;
let generateAllYear = new Date().getFullYear();
let generateAllMonth = new Date().getMonth() + 1;
let providers: any[] = [];

async function loadInvoices() {
  loading = true;
  try {
    invoices = await fetchFromAPI('/invoices', {
      headers: { Authorization: `Bearer ${get(accessToken)}` }
    });
  } catch (e) {
    notifications.error('Erreur lors du chargement des factures');
  }
  loading = false;
}

async function fetchProviders() {
	try {
		providers = await fetchFromAPI('/providers', {
			headers: { Authorization: `Bearer ${get(accessToken)}` }
		});
	} catch (e) {
		notifications.error('Erreur lors du chargement des prestataires');
	}
}

onMount(() => onDestroy(tabTitle('admin.invoices.tab_title')));
onMount(loadInvoices);
onMount(fetchProviders);

async function handleGenerateAll() {
  generatingAll = true;
  try {
    const results: any = await fetchFromAPI('/invoices/admin/generate-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${get(accessToken)}` }
    });

    let successCount = 0;
    let errorCount = 0;
    const errorMessages: string[] = [];

    results.forEach((result: any) => {
      if (result.status === 'success') {
        successCount++;
      } else {
        errorCount++;
        errorMessages.push(`Provider #${result.providerId}: ${result.message}`);
      }
    });

    if (successCount > 0) {
      notifications.success(`${successCount} facture(s) générée(s) avec succès.`);
    }
    if (errorCount > 0) {
      // Pour éviter une notification trop longue, on peut la tronquer
      const displayMessage = errorMessages.slice(0, 2).join(', ');
      notifications.error(
        `${errorCount} erreur(s) lors de la génération. ${displayMessage}${errorMessages.length > 2 ? '...' : ''}`
      );
    }
    if (successCount === 0 && errorCount === 0) {
      notifications.info("Aucun prestataire n'avait de nouveaux paiements à facturer.");
    }

    await loadInvoices();
    showGenerateAllModal = false;
  } catch (e: any) {
    notifications.error(e?.data?.message || 'Erreur lors de la génération groupée des factures');
  }
  generatingAll = false;
}

function openModal(providerId: number, providerName?: string) {
  selectedProvider = { id: providerId, name: providerName };
  showModal = true;
}

function closeModal() {
  showModal = false;
  selectedProvider = null;
}

async function handleGenerateForProvider() {
  if (!selectedProvider) return;
  generatingForProvider = true;
  try {
    await fetchFromAPI(`/invoices/admin/generate/${selectedProvider.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${get(accessToken)}` }
    });
    notifications.success('Facture générée pour ce provider');
    await loadInvoices();
    closeModal();
  } catch (e: any) {
    if (e.status === 409) {
      notifications.warning(e.data?.message || 'Aucun nouveau paiement à facturer.');
    } else {
      notifications.error(e.data?.message || 'Erreur lors de la génération de la facture');
    }
  }
  generatingForProvider = false;
}

function openProviderModal() {
  showProviderModal = true;
  providerInputId = '';
}

function closeProviderModal() {
  showProviderModal = false;
  providerInputId = '';
}

async function handleGenerateForInputProvider() {
  if (!providerInputId) return;
  generatingProviderInput = true;
  try {
    await fetchFromAPI(`/invoices/admin/generate/${providerInputId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${get(accessToken)}` }
    });
    notifications.success('Facture générée pour ce provider');
    await loadInvoices();
    closeProviderModal();
  } catch (e: any) {
    if (e.status === 409) {
      notifications.warning(e.data?.message || 'Aucun nouveau paiement à facturer.');
    } else {
      notifications.error(e.data?.message || 'Erreur lors de la génération de la facture');
    }
  }
  generatingProviderInput = false;
}

function formatMonthYear(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}


async function generateForProvider() {
  if (!selectedProvider) return;
  generatingForProvider = true;
  try {
    await fetchFromAPI(`/invoices/admin/generate/${selectedProvider.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${get(accessToken)}` }
    });
    notifications.success('Facture générée pour ce provider');
    await loadInvoices();
    closeModal();
  } catch (e: any) {
    if (e.status === 409) {
      notifications.warning(e.data?.message || 'Aucun nouveau paiement à facturer.');
    } else {
      notifications.error(e.data?.message || 'Erreur lors de la génération de la facture');
    }
  }
  generatingForProvider = false;
}
</script>

<div class="mx-auto max-w-5xl min-h-screen p-6">
  <div class="flex items-center justify-between mb-6 gap-2 flex-wrap">
    <h1 class="font-author text-2xl text-gray-800">Factures générées</h1>
    <div class="flex gap-2 flex-wrap">
      <button class="btn btn-primary" on:click={() => (showGenerateAllModal = true)}>
        Générer toutes les factures du mois
      </button>
      <button class="btn btn-secondary" on:click={openProviderModal}>
        Générer pour un provider…
      </button>
    </div>
  </div>

  {#if loading}
    <div>Chargement…</div>
  {:else}
    <div class="overflow-x-auto">
      <table class="table w-full table-zebra table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Provider</th>
            <th>Mois</th>
            <th>Statut</th>
            <th>PDF</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each invoices as invoice}
            <tr>
              <td>{invoice.id}</td>
              <td>{invoice.providerId}</td>
              <td>{formatMonthYear(invoice.createdAt)}</td>
              <td>{invoice.status}</td>
              <td>
                <button class="btn btn-xs btn-outline" on:click={() => window.open(invoice.documentUrl, '_blank')}>
                  Voir PDF
                </button>
              </td>
              <td>
                <button class="btn btn-xs btn-secondary" on:click={() => openModal(invoice.providerId)}>
                  Générer ce mois pour ce provider
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if showModal && selectedProvider}
    <div class="modal modal-open">
      <div class="modal-box">
        <h2 class="text-lg font-bold mb-4">Générer la facture du mois pour le provider #{selectedProvider.id}</h2>
        <div class="modal-action flex justify-end gap-2 mt-6">
          <button class="btn" on:click={closeModal} disabled={generatingForProvider}>Annuler</button>
          <button class="btn btn-primary" on:click={handleGenerateForProvider} disabled={generatingForProvider}>
            {generatingForProvider ? 'Génération…' : 'Générer'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if showProviderModal}
    <div class="modal modal-open">
      <div class="modal-box">
        <h2 class="text-lg font-bold mb-4">Générer la facture du mois pour un provider</h2>
        <select class="select select-bordered w-full" bind:value={providerInputId}>
          <option disabled selected value="">Sélectionnez un prestataire</option>
          {#each providers as provider}
            <option value={provider.id}>{provider.name} (ID: {provider.id})</option>
          {/each}
        </select>
        <div class="modal-action flex justify-end gap-2 mt-6">
          <button class="btn" on:click={closeProviderModal} disabled={generatingProviderInput}>Annuler</button>
          <button class="btn btn-primary" on:click={handleGenerateForInputProvider} disabled={generatingProviderInput || !providerInputId}>
            {generatingProviderInput ? 'Génération…' : 'Générer'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if showGenerateAllModal}
    <div class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Générer les factures pour une période</h3>
        <p class="py-4">
          Veuillez sélectionner l'année et le mois pour lesquels vous souhaitez générer les factures.
        </p>
        <div class="form-control w-full">
          <label class="label" for="year-input">
            <span class="label-text">Année</span>
          </label>
          <input
            id="year-input"
            type="number"
            bind:value={generateAllYear}
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-control w-full mt-4">
          <label class="label" for="month-input">
            <span class="label-text">Mois</span>
          </label>
          <input
            id="month-input"
            type="number"
            bind:value={generateAllMonth}
            class="input input-bordered w-full"
          />
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" on:click={() => (showGenerateAllModal = false)}>
            Annuler
          </button>
          <button class="btn btn-primary" on:click={handleGenerateAll} disabled={generatingAll}>
            {#if generatingAll}
              <span class="loading loading-spinner"></span>
            {/if}
            Générer
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if showGenerateProviderModal}
    <div class="modal modal-open">
      <div class="modal-box">
        <h2 class="text-lg font-bold mb-4">Générer la facture du mois pour un provider</h2>
        <input
          class="input input-bordered w-full mb-4"
          type="number"
          placeholder="ID du provider"
          bind:value={providerInputId}
          min="1"
        />
        <div class="modal-action flex justify-end gap-2 mt-6">
          <button class="btn" on:click={closeProviderModal} disabled={generatingProviderInput}>Annuler</button>
          <button class="btn btn-primary" on:click={handleGenerateForInputProvider} disabled={generatingProviderInput || !providerInputId}>
            {generatingProviderInput ? 'Génération…' : 'Générer'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div> 