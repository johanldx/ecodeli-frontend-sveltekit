<script lang="ts">
  import '../../../app.css';

  // Fonctions de gestion des clics (inchangées)
  function handleManageSubscription() {
    alert('Redirection vers la gestion de l\'abonnement...');
  }

  function handleManageAccount() {
    alert('Redirection vers la gestion du compte global...');
  }

  function handleManageAddresses() {
    alert('Redirection vers la gestion des adresses...');
  }

  function handleValidateIBAN() {
    const ibanInput = document.querySelector('input[placeholder="Mon IBAN"]') as HTMLInputElement;
    if (ibanInput && ibanInput.value) {
      alert(`IBAN validé : ${ibanInput.value}`);
    } else {
      alert('Veuillez entrer un IBAN valide.');
    }
  }

  function handleTransferToBank() {
    alert('Redirection vers le transfert vers un compte bancaire...');
  }
</script>

<div class="p-6 bg-[#FEFCF3] min-h-screen max-w-2xl ml-0">
  <h1 class="text-2xl font-author mb-6 text-gray-800">Mon compte client</h1>
  
  <!-- Section Abonnement -->
  <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
    <div class="mb-4">
      <p class="text-sm text-gray-600 mb-2">Mon abonnement</p>
      <div class="flex items-center">
        <div class="bg-gray-100 py-2 px-4 flex-grow mr-2 rounded-md">
          <p class="text-gray-700">Premium</p>
        </div>
        <!-- Bouton "Gérer l'abonnement" avec hover -->
        <button 
          on:click={handleManageSubscription} 
          class="bg-primary text-primary-content py-2 px-6 rounded-md text-sm hover:bg-primary-focus transition-colors"
        >
          Gérer
        </button>
      </div>
    </div>
    
    <!-- Bouton "Gérer mon compte global" avec hover -->
    <button 
      on:click={handleManageAccount} 
      class="bg-primary text-primary-content py-3 w-full rounded-md text-sm mb-3 hover:bg-primary-focus transition-colors"
    >
      Gérer mon compte global
    </button>
    
    <!-- Bouton "Gérer mes adresses" avec hover -->
    <button 
      on:click={handleManageAddresses} 
      class="bg-secondary text-secondary-content py-3 w-full rounded-md text-sm hover:bg-secondary-focus transition-colors"
    >
      Gérer mes adresses
    </button>
  </div>
  
  <!-- Section Portefeuille électronique -->
  <h1 class="text-2xl font-bold mb-6 text-gray-800">Mon portefeuille électronique</h1>
  
  <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <div class="flex justify-center gap-16 mb-6">
      <div class="text-center">
        <p class="text-2xl font-semibold text-gray-800">49,75 €</p>
        <p class="text-sm text-gray-600">Montant disponible</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-semibold text-gray-800">49,75 €</p>
        <p class="text-sm text-gray-600">Montant en attente</p>
      </div>
    </div>
    
    <!-- Champ IBAN et bouton "Valider" avec hover -->
    <div class="flex items-center gap-2 mb-4">
      <input 
        type="text" 
        placeholder="Mon IBAN" 
        class="flex-[1_1_auto] w-0 bg-gray-100 py-2 px-4 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
      />
      <!-- Bouton "Valider l'IBAN" avec hover -->
      <button 
        on:click={handleValidateIBAN} 
        class="flex-none bg-primary text-primary-content py-2 px-6 rounded-md text-sm hover:bg-primary-focus transition-colors"
      >
        Valider
      </button>
    </div>
    
    <!-- Bouton "Transférer vers un compte bancaire" avec hover -->
    <button 
      on:click={handleTransferToBank} 
      class="bg-primary text-primary-content py-3 w-full rounded-md text-sm hover:bg-primary-focus transition-colors"
    >
      Transférer vers un compte bancaire
    </button>
  </div>
</div>