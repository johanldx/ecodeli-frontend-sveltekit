<script lang="ts">
  import { t } from '$lib/utils/t';

  const title = t('app.clients.addresses.title');
  const name = t('app.clients.addresses.name');
  const address = t('app.clients.addresses.address');
  const postal_code = t('app.clients.addresses.postal_code');
  const city = t('app.clients.addresses.city');
  const country = t('app.clients.addresses.country');
  const add_address = t('app.clients.addresses.add_address');
  const modify = t('app.clients.addresses.modify');
  const delete_address = t('app.clients.addresses.delete_address');

  // Fonctions de gestion des clics
  function handleEditAddress() {
    alert('Modification de l\'adresse...');
  }

  function handleDeleteAddress() {
    alert('Suppression de l\'adresse...');
  }

  function handleAddAddress() {
    alert('Ajout d\'une nouvelle adresse...');
  }
</script>

<div class="p-6 bg-[#FEFCF3] min-h-screen">
  <h1 class="text-2xl font-author mb-6 text-gray-800">{$title}</h1>

  <div class="flex gap-6 flex-wrap">
    <!-- Adresse 1 -->
    <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-96">
      <label class="text-lg font-author mb-2 text-gray-700 block">{$name}</label>
      <input 
        type="text" 
        placeholder="Chez moi" 
        class="w-full p-2 border border-gray-300 rounded-md mb-4 bg-gray-100 input input-bordered focus:outline-none focus:ring focus:ring-primary/50 focus:border-primary"
      />

      <label class="font-author text-gray-700 block">{$address}</label>
      <input 
        type="text" 
        placeholder="21 cours Mgr Romero"
        class="w-full p-2 border border-gray-300 rounded-md mb-2 bg-gray-100 input input-bordered focus:outline-none focus:ring focus:ring-primary/50 focus:border-primary"
      />

      <div class="flex gap-2">
        <div class="w-1/2">
          <label class="font-author text-gray-700 block">{$postal_code}</label>
          <input 
            type="text" 
            placeholder="91000"
            class="w-full p-2 border border-gray-300 rounded-md bg-gray-100 input input-bordered focus:outline-none focus:ring focus:ring-primary/50 focus:border-primary"
          />
        </div>
        <div class="w-1/2">
          <label class="font-author text-gray-700 block">{$city}</label>
          <input 
            type="text" 
            placeholder="Evry"
            class="w-full p-2 border border-gray-300 rounded-md bg-gray-100 input input-bordered focus:outline-none focus:ring focus:ring-primary/50 focus:border-primary"
          />
        </div>
      </div>
      
      <label class="font-author text-gray-700 block mt-2">{$country}</label>
      <input 
        type="text" 
        placeholder="France"
        class="w-full p-2 border border-gray-300 rounded-md mb-4 bg-gray-100 input input-bordered focus:outline-none focus:ring focus:ring-primary/50 focus:border-primary"
      />
      
      <!-- Boutons Modifier et Supprimer avec hover -->
      <div class="mt-4 flex gap-4">
        <button 
          on:click={handleEditAddress} 
          class="bg-primary text-primary-content py-2 px-4 rounded-md text-sm hover:bg-opacity-90 transition-colors"
        >
          {$modify}	
        </button>
        <button 
          on:click={handleDeleteAddress} 
          class="bg-error text-error-content py-2 px-4 rounded-md text-sm hover:bg-opacity-90 transition-colors"
        >
          {$delete_address}
        </button>
      </div>
    </div>
  </div>

  <!-- Bouton Ajouter une adresse avec hover -->
  <div class="mt-8">
    <button 
      on:click={handleAddAddress} 
      class="bg-secondary text-secondary-content py-2 px-6 rounded-md text-sm hover:bg-opacity-90 transition-colors"
    >
      {$add_address}
    </button>
  </div>
</div>