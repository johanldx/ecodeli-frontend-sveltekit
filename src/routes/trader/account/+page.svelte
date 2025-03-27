<script lang="ts">
  import '../../../app.css';
  
  // Fonctions de gestion des clics
  function handleManageDocuments() {
    alert('Redirection vers la gestion des pièces justificatives...');
  }
  
  function handleManageAccount() {
    alert('Redirection vers la gestion du compte global...');
  }
  
  function handleManageAddresses() {
    alert('Redirection vers la gestion des adresses...');
  }
  
  function handleManageSEPA() {
    alert('Redirection vers la gestion des prélèvements SEPA...');
  }
  
  function handleContactSupport() {
    alert('Redirection vers le service client...');
  }

  function handleViewInvoice(month: string) {
    alert(`Visualisation de la facture ${month}...`);
  }
</script>
  
<div class="p-6 bg-[#FEFCF3]">
  <div class="max-w-6xl mx-auto">
    <h1 class="text-2xl font-author mb-6 text-gray-800">Mon compte commerçants</h1>
    
    <div class="flex flex-col lg:flex-row lg:gap-6">
      <!-- Colonne de gauche -->
      <div class="lg:w-2/3">
        <!-- Section Compte -->
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <div class="space-y-4">
            <button 
              on:click={handleManageDocuments} 
              class="bg-primary text-primary-content py-2 w-full rounded-md text-sm hover:bg-emerald-500 transition-colors"
            >
              Gérer mes pièces justificatives
            </button>
            
            <button 
              on:click={handleManageAccount} 
              class="bg-primary text-primary-content py-2 w-full rounded-md text-sm hover:bg-emerald-500 transition-colors"
            >
              Gérer mon compte global
            </button>
            
            <button 
              on:click={handleManageAddresses} 
              class="bg-neutral text-white py-2 w-full rounded-md text-sm hover:bg-gray-700 transition-colors"
            >
              Gérer mes adresses
            </button>
          </div>
        </div>
        
        <!-- Section Prélèvements -->
        <h2 class="text-xl font-author mb-4 text-gray-800">Mes prélèvements SEPA</h2>
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div class="flex flex-col items-center mb-6">
            <p class="text-2xl font-author text-gray-800">49,75 €</p>
            <p class="text-sm text-gray-600">Montant facturé ce mois-ci</p>
          </div>
          
          <button 
            on:click={handleManageSEPA} 
            class="bg-primary text-primary-content py-2 w-full rounded-md text-sm hover:bg-emerald-500 transition-colors"
          >
            Gérer mes prélèvements
          </button>
        </div>
      </div>
      
      <!-- Colonne de droite -->
      <div class="lg:w-1/3 mt-6 lg:mt-0">
        <!-- Section Tarification -->
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <h2 class="text-xl font-author mb-2">Tarification spécial : -15%</h2>
          <p class="text-sm text-gray-600 mb-4">Vous pouvez contacter le service client pour toute demande.</p>
          
          <button 
            on:click={handleContactSupport} 
            class="w-full py-2 px-4 bg-neutral text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            Contacter le service client
          </button>
        </div>

        <!-- Section Factures -->
        <h2 class="text-xl font-author mb-4 text-gray-800">Mes factures</h2>
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div class="space-y-3">
            <button 
              on:click={() => handleViewInvoice('Octobre 2024')} 
              class="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
            >
              <span>Octobre 2024</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <button 
              on:click={() => handleViewInvoice('Novembre 2024')} 
              class="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
            >
              <span>Novembre 2024</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <button 
              on:click={() => handleViewInvoice('Décembre 2024')} 
              class="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
            >
              <span>Décembre 2024</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

