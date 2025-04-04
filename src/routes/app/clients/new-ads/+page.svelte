<script lang="ts">
    import { onMount } from "svelte";
    import { t } from '$lib/utils/t';

    const main_title = t('app.clients.new-ads.main_title');
    const delivery_announcement = t('app.clients.new-ads.delivery_announcement');
    const title = t('app.clients.new-ads.title');
    const address = t('app.clients.new-ads.address');
    const picture = t('app.clients.new-ads.picture');
    const add_picture = t('app.clients.new-ads.add_picture');
    const desired_delivery_date = t('app.clients.new-ads.desired_delivery_date');
    const package_size = t('app.clients.new-ads.package_size');
    const total_price_offer = t('app.clients.new-ads.total_price_offer');
    const departure = t('app.clients.new-ads.departure');
    const add_a_step = t('app.clients.new-ads.add_a_step');
    const arrival = t('app.clients.new-ads.arrival');
    const add = t('app.clients.new-ads.add');  
    const cancel = t('app.clients.new-ads.cancel');
    
    interface Step {
      id: number;
      address: string;
    }
  
    let titles = "Besoin de déplacer un canapé";
    let addresses = "J'aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.";
    let image = "/mnt/data/image.png";
    let deliveryDate = "2025-04-04";
    let packageSize = "XXL";
    let totalPrice = "120 €";
    
    let departures = "Adresse 1";
    let arrivals = "Adresse 2";
  
    let steps: Step[] = [];
    let stepId = 1;
  
    function addStep() {
      steps.push({ id: stepId++, address: "" });
    }
  
    function removeStep(id: number) {
      steps = steps.filter(step => step.id !== id);
    }
  
    function submitAnnouncement() {
      const announcement = {
        titles,
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
      titles = "Besoin de déplacer un canapé";
      addresses = "J'aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.";
      image = "/mnt/data/image.png";
      deliveryDate = "2025-04-04";
      packageSize = "XXL";
      totalPrice = "120 €";
      departures = "Adresse 1";
      arrivals = "Adresse 2";
      steps = [];
      stepId = 1;
      alert("Form reset successfully!");
    }
  </script>
  
  <div class="p-6 bg-base-200 min-h-screen flex flex-col items-center font-author">
    <div class="w-full max-w-7xl">
      <h1 class="text-2xl font-author mb-4">{$main_title}</h1>

      <div class="form-control mb-4">
        <select class="select select-bordered rounded-md">
          <option selected>{$delivery_announcement}</option>
        </select>
      </div>

      <div class="flex justify-between space-x-6">
        <div class="w-2/3 bg-white shadow-md rounded-lg p-6">
          <label class="label"><span class="label-text font-author">{$title}</span></label>
          <input type="text" class="input input-bordered w-full rounded-md" bind:value={titles} />

          <label class="label mt-2"><span class="label-text font-author">{$address}</span></label>
          <textarea class="textarea textarea-bordered w-full rounded-md" bind:value={addresses}></textarea>

          <label class="label mt-2"><span class="label-text font-author">{$picture}</span></label>
          <div class="flex items-center space-x-2">
            <button class="btn btn-accent rounded-md">{$add_picture}</button>
            <input type="text" class="input input-bordered w-full rounded-md" bind:value={image} readonly />
          </div>

          <label class="label mt-2"><span class="label-text font-author">{$desired_delivery_date}</span></label>
          <input type="date" class="input input-bordered w-full rounded-md" bind:value={deliveryDate} />

          <label class="label mt-2"><span class="label-text font-author">{$package_size}</span></label>
          <select class="select select-bordered w-full rounded-md" bind:value={packageSize}>
            <option>XS</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option selected>XXL</option>
          </select>

          <label class="label mt-2"><span class="label-text font-author">{$total_price_offer}</span></label>
          <input type="text" class="input input-bordered w-full rounded-md" bind:value={totalPrice} />
        </div>

        <div class="w-2/3 flex flex-col space-y-6">
            <div class="bg-white shadow-md rounded-lg p-6">
              <label class="label"><span class="label-text font-author">{$departure}</span></label>
              <br>
              <select class="select select-bordered w-20px rounded-md" bind:value={departures}>
                <option selected>Adresse 1</option>
              </select>
            </div>
          
            <div class="flex justify-center">
              <button class="btn btn-accent w-1/3 rounded-md" on:click={addStep}>{$add_a_step}</button>
            </div>
          
            <div class="bg-white shadow-md rounded-lg p-6">
              <label class="label"><span class="label-text font-author">{$arrival}</span></label>
              <br>
              <select class="select select-bordered w-20px rounded-md" bind:value={arrivals}>
                <option selected>Adresse 2</option>
              </select>
            </div>
          </div>
      </div>
      
      <div class="mt-4">
        {#each steps as step (step.id)}
          <div class="flex items-center mt-2 space-x-2">
            <input type="text" class="input input-bordered w-full rounded-md" bind:value={step.address} placeholder="Nouvelle étape" />
            <button class="btn btn-error btn-sm rounded-md" on:click={() => removeStep(step.id)}>✖</button>
          </div>
        {/each}
      </div>

      <div class="flex justify-center mt-6">
        <button class="btn btn-primary w-1/9 mr-2 rounded-md" on:click={submitAnnouncement}>{$add_a_step}</button>
        <button class="btn btn-error w-1/9 ml-2 rounded-md" on:click={resetForm}>{$cancel}</button>
      </div>
    </div>
  </div>