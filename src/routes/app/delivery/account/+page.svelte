<script lang="ts">
    import '../../../../app.css';
    
    // Fonction de validation de l'IBAN
    function handleValidateIBAN() {
        alert("Validation de l'IBAN");
        console.log("IBAN validé");
    }

    // Fonction de transfert vers la banque
    function handleTransferToBank() {
        alert("Transfert vers un compte bancaire");
        console.log("Transfert vers la banque initié");
    }

    // Fonctions de gestion avec alertes
    function handleManageDocuments() {
        alert("Redirection vers la gestion des pièces justificatives");
        console.log("Gérer mes pièces justificatives cliqué");
    }

    function handleManageAccount() {
        alert("Redirection vers la gestion du compte global");
        console.log("Gérer mon compte global cliqué");
    }

    function handleManageAddresses() {
        alert("Redirection vers la gestion des adresses");
        console.log("Gérer mes adresses cliqué");
    }

    // Gestion des notifications
    function handleToggleNotification(event: Event) {
        const checkbox = event.target as HTMLInputElement;
        if (checkbox.checked) {
            alert("Notifications activées");
            console.log("Notifications activées");
        } else {
            alert("Notifications désactivées");
            console.log("Notifications désactivées");
        }
    }

    function handleConfirmNotifications() {
        alert("Notifications confirmées");
        console.log("Notifications confirmées");
    }
</script>

<main class="flex flex-col w-full max-w-screen-lg mx-auto px-4 py-6">
    <h1 class="font-author text-2xl mb-6">Mon compte livreur</h1>
  
    <!-- Conteneur principal avec disposition en grille -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne de gauche (2/3 de largeur) -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Carte Options du compte -->
            <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div class="flex flex-col gap-4">
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

            <!-- Carte Portefeuille électronique -->
            <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 class="font-author text-2xl mb-4">Mon portefeuille électronique</h2>
                
                <div class="flex justify-center gap-16 mb-6">
                    <div class="text-center">
                        <p class="text-2xl font-author text-gray-800">49,75 €</p>
                        <p class="text-sm text-gray-600">Montant disponible</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-author text-gray-800">49,75 €</p>
                        <p class="text-sm text-gray-600">Montant en attente</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-2 mb-4">
                    <input 
                        type="text" 
                        placeholder="Mon IBAN" 
                        class="flex-1 bg-gray-100 py-2 px-4 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <button 
                        on:click={handleValidateIBAN} 
                        class="bg-primary text-primary-content py-2 px-6 rounded-md text-sm hover:bg-emerald-500 transition-colors"
                    >
                        Valider
                    </button>
                </div>
                
                <button 
                    on:click={handleTransferToBank} 
                    class="bg-primary text-primary-content py-3 w-full rounded-md text-sm hover:bg-emerald-500 transition-colors"
                >
                    Transférer vers un compte bancaire
                </button>
            </div>
        </div>

        <!-- Colonne de droite (1/3 de largeur) - Carte des notifications -->
        <div class="lg:col-span-1">
            <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-[250px] sticky top-6">
                <div class="flex flex-col items-center justify-center h-full gap-6">
                    <div class="flex items-center justify-center">
                        <input 
                            type="checkbox" 
                            class="checkbox" 
                            on:change={handleToggleNotification}
                        />
                        <h3 class="ml-2 text-center">
                            Notifications de concordance de livraisons par mail
                        </h3>
                    </div>
                    <button 
                        on:click={handleConfirmNotifications} 
                        class="bg-primary text-primary-content py-2 px-6 rounded-md text-sm hover:bg-emerald-500 transition-colors"
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    </div>
</main>
