<script lang="ts">
  import '../../../app.css';

  // Données des annonces
  const announcements = [
    {
      id: 1,
      type: "Particulier",
      price: "140 €",
      title: "Transport de colis en France",
      description: "J’aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.",
      image: null, // Aucune photo pour l'instant
    },
    {
      id: 2,
      type: "Particulier",
      price: "140 €",
      title: "Transport de colis en France",
      description: "J’aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.",
      image: null, // Aucune photo pour l'instant
    },
    {
      id: 3,
      type: "Particulier",
      price: "140 €",
      title: "Transport de colis en France",
      description: "J’aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.",
      image: null, // Aucune photo pour l'instant
    },
  ];

  // Fonctions de gestion des clics
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

<div class="p-6 bg-base-200 min-h-screen">
  <h1 class="text-2xl font-bold mb-6 text-gray-800">Mes annonces</h1>

  <!-- Liste des annonces -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each announcements as announcement}
      <div class="card bg-base-100 shadow-sm w-full max-w-sm mx-auto">
        <!-- Section pour la photo -->
        <figure class="bg-gray-200 h-48 flex items-center justify-center">
          {#if announcement.image}
            <img src={announcement.image} alt={announcement.title} class="w-full h-full object-cover" />
          {:else}
            <span class="text-gray-500">Aucune photo disponible</span>
          {/if}
        </figure>

        <!-- Contenu de la carte -->
        <div class="card-body p-6">
          <!-- Type et prix -->
          <div class="flex items-center gap-2 mb-4">
            <!-- Bouton "Particulier" avec DaisyUI et couleur du thème -->
            <button class="btn  btn-outline btn-neutral btn-sm">
              {announcement.type}
            </button>
            <!-- Bouton "Prix" avec DaisyUI et couleur du thème -->
            <button class="btn btn-neutral btn-info btn-sm">
              {announcement.price}
            </button>
          </div>

          <!-- Titre et description -->
          <h2 class="card-title">{announcement.title}</h2>
          <p class="text-sm text-gray-600">{announcement.description}</p>

          <!-- Boutons d'action -->
          <div class="card-actions justify-start mt-6">
            <!-- Bouton "Modifier" avec DaisyUI et couleur du thème -->
            <button 
              on:click={() => handleEditAnnouncement(announcement.id)} 
              class="btn btn-primary rounded-md"
            >
              Modifier
            </button>
            <!-- Bouton "Détails" avec DaisyUI et couleur du thème -->
            <button 
              on:click={() => handleViewDetails(announcement.id)} 
              class="btn btn-neutral-content rounded-md"
            >
              Détails
            </button>
            <!-- Bouton "Annuler" avec DaisyUI et couleur du thème -->
            <button 
              on:click={() => handleCancelAnnouncement(announcement.id)} 
              class="btn btn-error rounded-md"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Bouton Ajouter une annonce -->
  <div class="mt-8 text-center">
    <button 
      on:click={handleAddAnnouncement} 
      class="btn btn-primary rounded-md"
    >
      Ajouter une nouvelle annonce !
    </button>
  </div>

  <!-- Message de confirmation -->
  <div class="mt-6 text-center text-green-600">
    // à définir dans le back message de confirmation
  </div>
</div>