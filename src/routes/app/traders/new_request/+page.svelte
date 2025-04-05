<script lang="ts">

import { t } from '$lib/utils/t';

const titles = t('app.traders.new_request.title');
const add = t('app.traders.new_request.add');
const cancel = t('app.traders.new_request.cancel');
const announce = t('app.traders.new_request.announce');

const requests_title = t('app.traders.requests.title');
const addresses = t('app.traders.requests.address');
const picture = t('app.traders.requests.picture');
const add_picture = t('app.traders.requests.add');
const desired_delivery_date = t('app.traders.requests.desired_delivery_date');
const package_size = t('app.traders.requests.package_size'); 
const total_price_offer = t('app.traders.requests.total_price_offer');

const mail = t('app.traders.contact.mail');
const departures = t('app.traders.contact.departure');
const arrivals = t('app.traders.contact.arrival');
const first_address = t('app.traders.contact.first_address');
const second_address = t('app.traders.contact.second_address');

    interface Step {
        id: number;
        address: string;
    }

    let title = "Besoin de déplacer un canapé";
    let address = "J'aurai besoin de faire transporter mon magnifique canapé de Paris vers Lyon.";
    let image = "/mnt/data/image.png";
    let deliveryDate = "2025-04-04";
    let packageSize = "XXL";
    let totalPrice = "120 €";
    let clientEmail = "client@ecodeli.fr";

    let departure = "Adresse 1";
    let arrival = "Adresse 2";

    let steps: Step[] = [];
    let stepId = 1;

    function addStep() {
        steps = [...steps, { id: stepId++, address: "" }];
    }

    function removeStep(id: number) {
        steps = steps.filter(step => step.id !== id);
    }

    async function submitAnnouncement() {
        if (!title || !address || !deliveryDate) {
            alert("Veuillez remplir les champs obligatoires");
            return;
        }

        try {
            const [priceValue, currency] = totalPrice.split(" ");
            const announcementData = {
                title,
                description: address,
                image,
                deliveryDate: new Date(deliveryDate).toISOString(),
                packageSize,
                price: {
                    amount: parseFloat(priceValue),
                    currency: currency || "€"
                },
                route: {
                    departure,
                    arrival,
                    steps: steps.filter(step => step.address.trim() !== "")
                },
                clientEmail,
                status: "PENDING",
                createdAt: new Date().toISOString()
            };

            const response = await mockApiCall(announcementData);
            
            console.log("Réponse du serveur:", response);
            alert("Annonce créée avec succès!");
            resetForm();
            
        } catch (error) {
            console.error("Erreur:", error);
            alert("Une erreur est survenue lors de la création de l'annonce");
        }
    }

    async function mockApiCall(data: any) {
        console.log("Données envoyées au serveur:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { 
            success: true, 
            id: Math.floor(Math.random() * 1000),
            ...data 
        };
    }

    function resetForm() {
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
    }
</script>

<div class="p-6 bg-base-200 min-h-screen flex flex-col items-start font-author">
  <div class="w-full max-w-7xl">
    <h1 class="text-2xl font-author mb-4">{$titles}</h1>

    <div class="form-control mb-4">
      <select class="select select-bordered rounded-md">
        <option selected>{$announce}</option>
      </select>
    </div>

    <div class="flex justify-between space-x-6">
      <div class="w-2/3 bg-white shadow-md rounded-lg p-4 flex flex-col space-y-1">
        <label class="label"><span class="label-text font-author">{$requests_title}</span></label>
        <input type="text" class="input input-bordered w-1/2 rounded-md" bind:value={title} />

        <label class="label mt-2"><span class="label-text font-author">{$addresses}</span></label>
        <textarea class="textarea textarea-bordered w-1/2 rounded-md" bind:value={address}></textarea>

        <label class="label mt-2"><span class="label-text font-author">{$picture}</span></label>
        <div class="flex items-center space-x-2">
          <button class="btn btn-accent rounded-md">{$add_picture}</button>
          <input type="text" class="input input-bordered w-1/2 rounded-md" bind:value={image} readonly />
        </div>

        <label class="label mt-2"><span class="label-text font-author">{$desired_delivery_date}</span></label>
        <input type="date" class="input input-bordered w-1/2 rounded-md" bind:value={deliveryDate} />

        <label class="label mt-2"><span class="label-text font-author">{$package_size}</span></label>
        <select class="select select-bordered w-1/2 rounded-md" bind:value={packageSize}>
          <option>XS</option>
          <option>S</option>
          <option>M</option>
          <option>L</option>
          <option selected>XXL</option>
        </select>

        <label class="label mt-2"><span class="label-text font-author">{$total_price_offer}</span></label>
        <input type="text" class="input input-bordered w-1/2 rounded-md" bind:value={totalPrice} />
      </div>

      <div class="w-2/3 flex flex-col space-y-6">
          <div class="bg-white shadow-md rounded-lg p-6 flex flex-col space-y-4">
              <div class="flex flex-col">
                  <label class="label">
                      <span class="label-text font-author">{$mail}</span>
                  </label>
                  <input type="email" class="input input-bordered w-1/2 rounded-md" bind:value={clientEmail} />
              </div>

              <div class="flex flex-col">
                  <label class="label">
                      <span class="label-text font-author">{$departures}</span>
                  </label>
                  <select class="select select-bordered w-1/2 rounded-md" bind:value={departure}>
                      <option selected>{$first_address}</option>
                  </select>
              </div>

              <div class="flex flex-col">
                  <label class="label">
                      <span class="label-text font-author">{$arrivals}</span>
                  </label>
                  <select class="select select-bordered w-1/2 rounded-md" bind:value={arrival}>
                      <option selected>{$second_address}</option>
                  </select>
              </div>
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
      <button class="btn btn-primary w-1/9 mr-2 rounded-md" on:click={submitAnnouncement}>{$add}</button>
      <button class="btn btn-error w-1/9 ml-2 rounded-md" on:click={resetForm}>{$cancel}</button>
    </div>
  </div>
</div>