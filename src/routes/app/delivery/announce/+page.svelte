<script lang="ts">
    interface Service {
      id: number;
      type: 'transport' | 'livraison';
      userType: 'particulier' | 'commerçant';
      title: string;
      description: string;
      price: number;
      image: string | null;
    }
  
    let selectedService = 'Transport';
    let searchCity = '';
    let showServiceMenu = false;
  
    // Données des services
    let services: Service[] = [
      {
        id: 1,
        type: 'transport',
        userType: 'particulier',
        title: 'Transport de colis en France',
        description: "J'aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.",
        price: 140,
        image: '/placeholder.svg?height=200&width=300'
      },
      {
        id: 2,
        type: 'livraison',
        userType: 'commerçant',
        title: 'Livraison de moins de 10km',
        description: "Livraison de produit frais de notre boutique vers le client (5km).",
        price: 420,
        image: null
      },
      {
        id: 3,
        type: 'transport',
        userType: 'particulier',
        title: 'Transport de colis en France',
        description: "J'aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.",
        price: 140,
        image: '/placeholder.svg?height=200&width=300'
      },
      {
        id: 4,
        type: 'livraison',
        userType: 'commerçant',
        title: 'Livraison de moins de 10km',
        description: "Livraison de produit frais de notre boutique vers le client (5km).",
        price: 420,
        image: null
      },
      {
        id: 5,
        type: 'transport',
        userType: 'particulier',
        title: 'Transport de colis en France',
        description: "J'aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.",
        price: 140,
        image: '/placeholder.svg?height=200&width=300'
      },
      {
        id: 6,
        type: 'livraison',
        userType: 'commerçant',
        title: 'Livraison de moins de 10km',
        description: "Livraison de produit frais de notre boutique vers le client (5km).",
        price: 420,
        image: null
      }
    ];
  
    function toggleServiceMenu() {
      showServiceMenu = !showServiceMenu;
    }
  
    function selectService(service: string) {
      selectedService = service;
      showServiceMenu = false;
    }
  
    function handleContact(id: number) {
      console.log(`Contacter pour le service ${id}`);
    }
  
    function handleDetails(id: number) {
      console.log(`Voir détails du service ${id}`);
    }
  </script>
  
  <div class="p-4 md:p-6 bg-base-200 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- Filtres -->
      <div class="mb-6 flex gap-4 relative">
        <div class="relative w-64">
          <button 
            on:click={toggleServiceMenu} 
            class="w-full p-2 border border-gray-300 rounded-md bg-white flex justify-between items-center"
          >
            {selectedService}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {#if showServiceMenu}
            <div class="fixed inset-0 z-40" on:click={() => showServiceMenu = false}></div>
            <div class="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 overflow-visible">
              <div class="p-2 hover:bg-gray-100 cursor-pointer" on:click={() => selectService('Tous les services')}>
                Tous les services
              </div>
              <div class="p-2 bg-primary text-white cursor-pointer" on:click={() => selectService('Transport')}>
                Transport
              </div>
              <div class="p-2 hover:bg-gray-100 cursor-pointer" on:click={() => selectService('Livraison')}>
                Livraison
              </div>
            </div>
          {/if}
        </div>
        
        <input 
          type="text" 
          placeholder="Ville" 
          bind:value={searchCity}
          class="p-2 border border-gray-300 rounded-md flex-grow"
        />
      </div>
      
      <!-- Liste des services -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {#each services as service}
          <div class="card bg-base-100 shadow-sm w-full mx-auto">
            <figure class="bg-gray-200 h-40 sm:h-48 flex items-center justify-center">
              {#if service.image}
                <img src={service.image || "/placeholder.svg"} alt={service.title} class="w-full h-full object-cover" />
              {:else}
                <div class="bg-blue-600 w-full h-full flex items-center justify-center">
                  <span class="text-white text-2xl font-bold">biocoop</span>
                </div>
              {/if}
            </figure>
            
            <div class="card-body p-4 md:p-6">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <button class="btn btn-outline btn-neutral btn-xs sm:btn-sm">
                  {service.userType === 'particulier' ? 'Particulier' : 'Commerçant'}
                </button>
                <button class="btn btn-neutral btn-info btn-xs sm:btn-sm">
                  {service.price} €
                </button>
              </div>
              
              <h2 class="card-title text-sm sm:text-base">{service.title}</h2>
              <p class="text-xs sm:text-sm text-gray-600">{service.description}</p>
              
              <div class="card-actions justify-start mt-4 flex flex-wrap gap-1 sm:gap-2">
                <button 
                  on:click={() => handleContact(service.id)} 
                  class="btn btn-primary btn-xs sm:btn-sm rounded-md"
                >
                  Contacter
                </button>
                <button 
                  on:click={() => handleDetails(service.id)} 
                  class="btn btn-neutral-content btn-xs sm:btn-sm rounded-md"
                >
                  Détails
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>