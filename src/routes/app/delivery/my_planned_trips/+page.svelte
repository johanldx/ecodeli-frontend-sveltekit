<script lang="ts">
  // Définition de l'interface pour un trajet
  interface Trajet {
    id: number;
    villeDepart: string;
    villeArrivee: string;
    jour: string;
  }

  // Données des trajets
  let trajets: Trajet[] = [
    {
      id: 1,
      villeDepart: "Paris",
      villeArrivee: "Lille",
      jour: "21/04/2025"
    },
    {
      id: 2,
      villeDepart: "Lille",
      villeArrivee: "Paris",
      jour: "23/04/2025"
    }
  ];

 // Fonctions de gestion des événements
function handleModifier(id: number): void {
  alert(`Modifier trajet ID: ${id}`);
}

function handleSupprimer(id: number): void {
  alert(`Supprimer trajet ID: ${id}`);
}
</script>

<div class="p-6 bg-[#FEFCF3] min-h-screen">
  <h1 class="text-2xl font-author mb-6 text-gray-800">Mes trajets prévus</h1>
  
  <div class="flex gap-6 flex-wrap">
    {#each trajets as trajet (trajet.id)}
      <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-96">
        <div class="space-y-4">
          <div>
            <label class="font-author text-gray-700 block">Ville de départ</label>
            <input 
              type="text" 
              bind:value={trajet.villeDepart} 
              class="w-full p-2 border border-gray-300 rounded-md bg-gray-100 input input-bordered focus:outline-none focus:ring focus:ring-primary/50 focus:border-primary"
            />
          </div>
          
          <div>
            <label class="font-author text-gray-700 block">Ville d'arrivée</label>
            <input 
              type="text" 
              bind:value={trajet.villeArrivee} 
              class="w-full p-2 border border-gray-300 rounded-md bg-gray-100 input input-bordered focus:outline-none focus:ring focus:ring-primary/50 focus:border-primary"
            />
          </div>
          
          <div>
            <label class="font-author text-gray-700 block">Jour</label>
            <input 
              type="text" 
              bind:value={trajet.jour} 
              class="w-full p-2 border border-gray-300 rounded-md bg-gray-100 input input-bordered focus:outline-none focus:ring focus:ring-primary/50 focus:border-primary"
            />
          </div>
          
          <div class="mt-4 flex gap-4">
            <button 
              on:click={() => handleModifier(trajet.id)} 
              class="bg-primary text-primary-content py-2 px-4 rounded-md text-sm hover:bg-opacity-90 transition-colors"
            >
              Modifier
            </button>
            
            <button 
              on:click={() => handleSupprimer(trajet.id)} 
              class="bg-error text-error-content py-2 px-4 rounded-md text-sm hover:bg-opacity-90 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>