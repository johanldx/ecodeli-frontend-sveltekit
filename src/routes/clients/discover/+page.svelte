<script>
  import '../../../app.css';
  let services = [
    { id: 1, category: "Taxi", title: "Transport à l’aéroport", price: 62, description: "Nous transportons de 1 à 4 personnes depuis toute l'IDF vers CDG et Orly.", image: "/taxi.jpg" },
    { id: 2, category: "Jardinage", title: "Entretien de jardin", price: 50, description: "Tonte de pelouse, taille des haies et entretien des espaces verts.", image: "/jardinage.jpg" },
    { id: 3, category: "Garde d'enfant", title: "Baby-sitting", price: 30, description: "Garde d’enfants à domicile en toute confiance.", image: "/garde.jpg" },
    { id: 4, category: "Taxi", title: "Trajet longue distance", price: 80, description: "Transport longue distance avec confort et sécurité.", image: "/taxi2.jpg" }
  ];

  let selectedCategory = "Tous les services";

  // Mise à jour automatique des services filtrés
  $: filteredServices = selectedCategory === "Tous les services"
    ? services
    : services.filter(s => s.category === selectedCategory);

  // Fonction pour gérer le clic sur "Contacter"
  /**
	 * @param {{ id?: number; category?: string; title: any; price?: number; description?: string; image?: string; }} service
	 */
  function handleContact(service) {
    alert(`Contacter le prestataire : ${service.title}`);
  }

  // Fonction pour gérer le clic sur "Détails"
  /**
	 * @param {{ id?: number; category?: string; title: any; price?: number; description: any; image?: string; }} service
	 */
  function handleDetails(service) {
    alert(`Détails du service : ${service.title}\nDescription : ${service.description}`);
  }
</script>

<div class="p-6 bg-base-200 min-h-screen">
  <div class="flex flex-wrap gap-4 mb-6">
    <!-- Sélecteur de catégorie -->
    <select bind:value={selectedCategory} class="w-full md:w-80 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary">
      <option>Tous les services</option>
      <option>Taxi</option>
      <option>Jardinage</option>
      <option>Garde d'enfant</option>
    </select>
  
    <!-- Champ de saisie pour la ville -->
    <input type="text" placeholder="Ville" class="w-full md:w-80 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary" />
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each filteredServices as service}
      <div class="card bg-base-100 shadow-md border border-gray-200 rounded-lg">
        <figure>
          <img src={service.image} alt={service.title} class="w-full h-40 object-cover rounded-t-lg" />
        </figure>
        <div class="p-4">
          <div class="badge badge-primary">Prestataire pro</div>
          <div class="text-lg font-author mt-2">{service.price} €</div>
          <h3 class="text-lg font-author mt-2">{service.title}</h3>
          <p class="text-sm text-gray-600">{service.description}</p>
          <div class="flex gap-2 mt-4">
            <!-- Bouton "Contacter" avec gestionnaire d'événements -->
            <button on:click={() => handleContact(service)} class="bg-primary text-black py-2 px-4 rounded-md text-sm h-10 hover:bg-gray-100 flex items-center justify-center">
              Contacter
            </button>
            <!-- Bouton "Détails" avec gestionnaire d'événements -->
            <button on:click={() => handleDetails(service)} class="bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm h-10 hover:bg-gray-300 transition-colors">
              Détails
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>