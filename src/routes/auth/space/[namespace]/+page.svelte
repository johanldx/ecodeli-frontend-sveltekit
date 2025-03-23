<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { t } from '$lib/utils/t';
    import { fetchFromAPI } from '$lib/utils/api';
    import { writable } from 'svelte/store';
  
    const loading = writable(true);
    const status = writable<'none' | 'pending' | 'rejected' | 'approved'>('none');
    const submitted = writable(false);
  
    const validationTypes = [
      { id: 'client', label: 'client' },
      { id: 'delivery', label: 'livreur' },
      { id: 'merchant', label: 'commerçant' },
      { id: 'provider', label: 'prestataire' }
    ];
  
    let selectedType = '';
    let namespace = '';
  
    onMount(async () => {
      namespace = $page.params.namespace;
      try {
        const res = await fetchFromAPI<{ status: string }>(`/space/${namespace}/status`);
        switch (res.status) {
          case 'approved':
            goto(`/app/${namespace}`);
            return;
          case 'pending':
            status.set('pending');
            break;
          case 'rejected':
            status.set('rejected');
            break;
          default:
            status.set('none');
        }
      } catch (e) {
        console.error('Erreur API :', e);
        status.set('none');
      } finally {
        loading.set(false);
      }
    });
  
    async function submitRequest() {
      if (!selectedType) return;
      try {
        await fetchFromAPI(`/space/${namespace}/request`, {
          method: 'POST',
          body: JSON.stringify({ type: selectedType })
        });
        submitted.set(true);
      } catch (e) {
        console.error('Erreur lors de la demande :', e);
      }
    }
  </script>
  
  {#if $loading}
    <div class="flex justify-center items-center h-screen">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <div class="flex justify-center items-center min-h-screen px-4 bg-base-content">
      <div class="card w-full max-w-xs bg-base-100 p-6 shadow-xl">
        <div class="text-center mb-4">
          <img src="/images/logo/ecodeli-icon-light.png" alt="EcoDeli" class="mx-auto h-5 mb-2" />
          <h1 class="text-base font-medium">Devenir {selectedType ? validationTypes.find(t => t.id === selectedType)?.label : namespace}</h1>
        </div>
  
        {#if $status === 'pending'}
          <p class="text-center text-sm">En attente de validation</p>
        {:else if $status === 'rejected'}
          <p class="text-center text-sm text-error mb-2">Demande refusée. Vous pouvez en refaire une.</p>
        {/if}
  
        {#if $status === 'none' || $status === 'rejected'}
          {#if $submitted}
            <p class="text-center text-success text-sm">Demande envoyée ✅</p>
          {:else}
            <div class="space-y-2">
              {#each validationTypes as type}
                <button
                  type="button"
                  class="btn w-full text-xs justify-between"
                  class:selected={selectedType === type.id}
                  on:click={() => selectedType = type.id}
                >
                  <span class="font-bold">{type.label}</span>
                  <span class="badge badge-outline">Preuve à déposer</span>
                </button>
              {/each}
  
              <button
                on:click={submitRequest}
                disabled={!selectedType}
                class="btn btn-success btn-sm w-full"
              >
                Faire la demande
              </button>
  
              <a href="/" class="text-xs underline block text-center">Retour</a>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
  

<!-- 
  
c'est affreux ça, ce que je veux :

- détection du type de profile
- état :
    - validé : redirection
    - en attente : message
    - refusé/vide : formulaire

-->