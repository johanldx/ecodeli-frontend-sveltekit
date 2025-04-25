<script lang="ts">

import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';

const title = t('app.traders.my_requests.title');
const modify = t('app.traders.my_requests.modify');
const details = t('app.traders.my_requests.details');
const cancel = t('app.traders.my_requests.cancel');
const add_new_announce = t('app.traders.my_requests.add_new_announce');
import { onDestroy, onMount } from 'svelte';

onMount(() => onDestroy(tabTitle('app.traders.my_requests')));
  
    const announcements = [
      {
        id: 1,
        type: "Commerçant",
        price: "4,20 €",
        title: "Livraison à moins de 10 km",
        description: "Livraison de produit frais de notre boutique vers le client (3KM).",
        image: null,
      },
      {
        id: 2,
        type: "Commerçant",
        price: "4,20 €",
        title: "Livraison à moins de 10 km",
        description: "Livraison de produit frais de notre boutique vers le client (3KM).",
        image: null,
      },
      {
        id: 3,
        type: "Commerçant",
        price: "4,20 €",
        title: "Livraison à moins de 10 km",
        description: "Livraison de produit frais de notre boutique vers le client (3KM).",
        image: null,
      },
    ];
  
    function handleEditAnnouncement(id: number) {
      alert(`Modifier l'annonce ${id}`);
    }
  
    function handleViewDetails(id: number) {
      alert(`Voir les détails de l'annonce ${id}`);
    }
  
    function handleCancelAnnouncement(id: number) {
      alert(`Annuler l'annonce ${id}`);
    }
  
    function handleAddAnnouncement() {
      alert('Ajouter une nouvelle annonce');
    }
  </script>
  
  <div class="p-4 md:p-6 bg-base-200 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-author mb-6 text-gray-800">{$title}</h1>
  
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {#each announcements as announcement}
          <div class="card bg-base-100 shadow-sm w-full mx-auto">
            <figure class="bg-gray-200 h-40 sm:h-48 flex items-center justify-center">
              {#if announcement.image}
                <img src={announcement.image} alt={announcement.title} class="w-full h-full object-cover" />
              {:else}
                <span class="text-gray-500">Aucune photo disponible</span>
              {/if}
            </figure>
    
            <div class="card-body p-4 md:p-6">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <button class="btn btn-outline btn-neutral btn-xs sm:btn-sm">
                  {announcement.type}
                </button>
                <button class="btn btn-neutral btn-info btn-xs sm:btn-sm">
                  {announcement.price}
                </button>
              </div>
    
              <h2 class="card-title text-sm sm:text-base">{announcement.title}</h2>
              <p class="text-xs sm:text-sm text-gray-600">{announcement.description}</p>
    
              <div class="card-actions justify-start mt-4 flex flex-wrap gap-1 sm:gap-2">
                <button 
                  on:click={() => handleEditAnnouncement(announcement.id)} 
                  class="btn btn-primary btn-xs sm:btn-sm rounded-md"
                >
                  {$modify}
                </button>
                <button 
                  on:click={() => handleViewDetails(announcement.id)} 
                  class="btn btn-neutral-content btn-xs sm:btn-sm rounded-md"
                >
                  {$details}
                </button>
                <button 
                  on:click={() => handleCancelAnnouncement(announcement.id)} 
                  class="btn btn-error btn-xs sm:btn-sm rounded-md"
                >
                  {$cancel}
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    
      <div class="mt-6 md:mt-8 text-center">
        <button 
          on:click={handleAddAnnouncement} 
          class="btn btn-primary btn-sm sm:btn-md rounded-md"
        >
          {$add_new_announce}
        </button>
      </div>
    
      <div class="mt-4 md:mt-6 text-center text-green-600 text-sm sm:text-base">
        // à définir dans le back message de confirmation
      </div>
    </div>
  </div>