<script lang="ts">
    import { onMount } from 'svelte';
  
    interface Appointment {
      id: string;
      day: string;
      hour: string;
      title: string;
      location?: string;
      special?: boolean;
    }
  
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const hours: string[] = Array.from({ length: 17 }, (_, i) => {
      const hour = i + 8;
      return hour === 24 ? '00h' : `${hour}h`;
    });
  
    let currentWeek = 12;
    let appointments: Appointment[] = [];
    let selectedAppointment: Appointment | null = null;
    let showModal = false;
    let loading = true;
  
    let showAddModal = false;
    let newAppointment: Appointment;
  
    function openAddModal() {
      showAddModal = true;
      newAppointment = {
        id: crypto.randomUUID(),
        day: days[0],
        hour: hours[0],
        title: '',
        location: '',
        special: false
      };
    }
  
    function addAppointment() {
      if (!newAppointment.title.trim()) return;
      appointments = [...appointments, newAppointment];
      showAddModal = false;
      // TODO: envoyer au backend
    }
  
    async function fetchAppointments(week: number): Promise<Appointment[]> {
      loading = true;
      await new Promise((res) => setTimeout(res, 300));
  
      const mockData: Appointment[] = [
        { id: '1', day: 'Lundi', hour: '8h', title: 'Jardinage et élagage' },
        { id: '2', day: 'Lundi', hour: '9h', title: 'Jardinage', location: 'Lyon' },
        { id: '3', day: 'Mardi', hour: '21h', title: 'Arrosage', special: true },
        { id: '4', day: 'Vendredi', hour: '00h', title: 'Intervention de nuit', location: 'Paris' }
      ];
  
      loading = false;
      return mockData;
    }
  
    async function loadAppointments() {
      appointments = await fetchAppointments(currentWeek);
    }
  
    onMount(loadAppointments);
  
    function prevWeek() {
      currentWeek--;
      loadAppointments();
    }
  
    function nextWeek() {
      currentWeek++;
      loadAppointments();
    }
  
    function handleAppointmentClick(appointment: Appointment) {
      selectedAppointment = appointment;
      showModal = true;
    }
  
    function cancelAppointment() {
      if (selectedAppointment) {
        alert(`Rendez-vous annulé : ${selectedAppointment.title}`);
        showModal = false;
      }
    }
  </script>
  
  <div class="p-6 bg-base-100 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <button on:click={prevWeek} class="btn btn-circle btn-sm btn-outline">←</button>
          <h1 class="text-xl font-bold">Semaine {currentWeek}</h1>
          <button on:click={nextWeek} class="btn btn-circle btn-sm btn-outline">→</button>
        </div>
        <button class="btn btn-primary" on:click={openAddModal}>Ajouter</button>
      </div>
  
      <!-- Calendrier -->
      {#if loading}
        <p class="text-center text-gray-500">Chargement des rendez-vous...</p>
      {:else}
        <div class="overflow-x-auto border border-base-300 rounded-lg">
          <table class="table table-zebra w-full">
            <thead class="bg-base-200 text-base font-semibold">
              <tr>
                <th class="bg-base-200 text-right">Heure</th>
                {#each days as day}
                  <th class="text-center">{day}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each hours as hour}
                <tr class="hover:bg-base-100 transition">
                  <td class="text-right font-medium bg-base-100">{hour}</td>
                  {#each days as day}
                    <td class="min-h-16 min-w-32 align-top border border-base-300">
                      {#each appointments.filter(a => a.day === day && a.hour === hour) as appointment}
                        <div
                          on:click={() => handleAppointmentClick(appointment)}
                          class={`mb-1 p-2 text-sm rounded cursor-pointer shadow-sm
                            ${appointment.special
                              ? 'bg-accent text-accent-content'
                              : 'bg-primary text-primary-content'}`}
                        >
                          <div class="font-semibold">{appointment.title}</div>
                          {#if appointment.location}
                            <div class="text-xs opacity-80">{appointment.location}</div>
                          {/if}
                        </div>
                      {/each}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  
    <!-- Modal : Détail -->
    {#if showModal && selectedAppointment}
      <dialog class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg">{selectedAppointment.title}</h3>
          {#if selectedAppointment.location}
            <p class="py-2">📍 {selectedAppointment.location}</p>
          {/if}
          <p class="py-2">🗓 {selectedAppointment.day} à {selectedAppointment.hour}</p>
  
          <div class="modal-action flex flex-col gap-2">
            <button on:click={() => alert('Conversation ouverte')} class="btn btn-primary w-full">
              Afficher la conversation
            </button>
            <button on:click={cancelAppointment} class="btn btn-error w-full">
              Annuler le rendez-vous
            </button>
            <button on:click={() => (showModal = false)} class="btn btn-ghost w-full">
              Fermer
            </button>
          </div>
        </div>
      </dialog>
    {/if}
  
    <!-- Modal : Ajout -->
    {#if showAddModal}
      <dialog class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-2">Nouveau rendez-vous</h3>
  
          <div class="form-control mb-2">
            <label class="label">
              <span class="label-text">Titre</span>
            </label>
            <input type="text" bind:value={newAppointment.title} class="input input-bordered" />
          </div>
  
          <div class="form-control mb-2">
            <label class="label">
              <span class="label-text">Jour</span>
            </label>
            <select bind:value={newAppointment.day} class="select select-bordered">
              {#each days as d}
                <option value={d}>{d}</option>
              {/each}
            </select>
          </div>
  
          <div class="form-control mb-2">
            <label class="label">
              <span class="label-text">Heure</span>
            </label>
            <select bind:value={newAppointment.hour} class="select select-bordered">
              {#each hours as h}
                <option value={h}>{h}</option>
              {/each}
            </select>
          </div>
  
          <div class="form-control mb-2">
            <label class="label">
              <span class="label-text">Lieu (optionnel)</span>
            </label>
            <input type="text" bind:value={newAppointment.location} class="input input-bordered" />
          </div>
  
          <div class="form-control mb-4">
            <label class="cursor-pointer label justify-start gap-2">
              <input type="checkbox" class="checkbox" bind:checked={newAppointment.special} />
              <span class="label-text">Spécial</span>
            </label>
          </div>
  
          <div class="modal-action flex flex-col gap-2">
            <button on:click={addAppointment} class="btn btn-success w-full">
              Ajouter
            </button>
            <button on:click={() => (showAddModal = false)} class="btn btn-ghost w-full">
              Annuler
            </button>
          </div>
        </div>
      </dialog>
    {/if}
  </div>
  