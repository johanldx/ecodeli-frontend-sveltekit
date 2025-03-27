<script lang="ts">
    import { onMount } from "svelte";
  
    interface Step {
      id: number;
      address: string;
    }
  
    let title = "Besoin de déplacer un canapé";
    let address = "J'aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.";
    let image = "/mnt/data/image.png"; // Remplace par un chemin local si nécessaire
    let deliveryDate = "2025-04-04";
    let packageSize = "XXL";
    let totalPrice = "120 €";
    
    let departure = "Adresse 1";
    let arrival = "Adresse 2";
  
    let steps: Step[] = [];
    let stepId = 1;
  
    function addStep() {
      steps.push({ id: stepId++, address: "" });
    }
  
    function removeStep(id: number) {
      steps = steps.filter(step => step.id !== id);
    }
  
    function submitAnnouncement() {
      // Logique pour soumettre l'annonce
      const announcement = {
        title,
        address,
        image,
        deliveryDate,
        packageSize,
        totalPrice,
        departure,
        arrival,
        steps
      };
      console.log("Announcement submitted :", announcement);
      alert("Announcement submitted successfully!");
    }
  
    function resetForm() {
      // Réinitialiser tous les champs du formulaire
      title = "Besoin de déplacer un canapé";
      address = "J'aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.";
      image = "/mnt/data/image.png";
      deliveryDate = "2025-04-04";
      packageSize = "XXL";
      totalPrice = "120 €";
      departure = "Adresse 1";
      arrival = "Adresse 2";
      steps = [];
      stepId = 1;
      alert("Form reset successfully!");
    }
  </script>
  
  <div class="p-6 bg-base-200 min-h-screen flex flex-col items-center font-author">
    <div class="w-full max-w-7xl">
      <h1 class="text-2xl font-author mb-4">Nouvelle annonce</h1>

      <div class="form-control mb-4">
        <select class="select select-bordered rounded-md">
          <option selected>Annonce de livraison</option>
        </select>
      </div>

      <!-- Conteneur principal pour aligner horizontalement -->
      <div class="flex justify-between space-x-6">
        <!-- Formulaire principal à gauche -->
        <div class="w-2/3 bg-white shadow-md rounded-lg p-6">
          <label class="label"><span class="label-text font-author">Titre</span></label>
          <input type="text" class="input input-bordered w-full rounded-md" bind:value={title} />

          <label class="label mt-2"><span class="label-text font-author">Adresse</span></label>
          <textarea class="textarea textarea-bordered w-full rounded-md" bind:value={address}></textarea>

          <label class="label mt-2"><span class="label-text font-author">Photos</span></label>
          <div class="flex items-center space-x-2">
            <button class="btn btn-accent rounded-md">Ajouter</button>
            <input type="text" class="input input-bordered w-full rounded-md" bind:value={image} readonly />
          </div>

          <label class="label mt-2"><span class="label-text font-author">Date de livraison souhaitée</span></label>
          <input type="date" class="input input-bordered w-full rounded-md" bind:value={deliveryDate} />

          <label class="label mt-2"><span class="label-text font-author">Taille du colis</span></label>
          <select class="select select-bordered w-full rounded-md" bind:value={packageSize}>
            <option>XS</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option selected>XXL</option>
          </select>

          <label class="label mt-2"><span class="label-text font-author">Prix total proposé</span></label>
          <input type="text" class="input input-bordered w-full rounded-md" bind:value={totalPrice} />
        </div>

        <!-- Conteneur droit pour Départ et Arrivée -->
        <div class="w-2/3 flex flex-col space-y-6">
            <!-- Bloc Départ -->
            <div class="bg-white shadow-md rounded-lg p-6">
              <label class="label"><span class="label-text font-author">Départ</span></label>
              <br>
              <select class="select select-bordered w-20px rounded-md" bind:value={departure}>
                <option selected>Adresse 1</option>
              </select>
            </div>
          
            <!-- Bouton Ajouter une étape -->
            <div class="flex justify-center"> <!-- Ajout d'un conteneur flex pour centrer le bouton -->
              <button class="btn btn-accent w-1/3 rounded-md" on:click={addStep}>Ajouter une étape</button>
            </div>
          
            <!-- Bloc Arrivée -->
            <div class="bg-white shadow-md rounded-lg p-6">
              <label class="label"><span class="label-text font-author">Arrivée</span></label>
              <br>
              <select class="select select-bordered w-20px rounded-md" bind:value={arrival}>
                <option selected>Adresse 2</option>
              </select>
            </div>
          </div>
      </div>
      
      <!-- Étapes supplémentaires -->
      <div class="mt-4">
        {#each steps as step (step.id)}
          <div class="flex items-center mt-2 space-x-2">
            <input type="text" class="input input-bordered w-full rounded-md" bind:value={step.address} placeholder="Nouvelle étape" />
            <button class="btn btn-error btn-sm rounded-md" on:click={() => removeStep(step.id)}>✖</button>
          </div>
        {/each}
      </div>

      <!-- Boutons -->
      <div class="flex justify-center mt-6">
        <button class="btn btn-primary w-1/9 mr-2 rounded-md" on:click={submitAnnouncement}>Ajouter</button>
        <button class="btn btn-error w-1/9 ml-2 rounded-md" on:click={resetForm}>Annuler</button>
      </div>
    </div>
  </div>