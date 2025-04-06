<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/utils/t';
  import { get } from 'svelte/store';

  // Traductions
  const add = t('app.providers.calendar.add');
  const times = t('app.providers.calendar.time');
  const titles = t('app.providers.calendar.title');
  const cancel = t('app.providers.calendar.cancel');
  const dayy = t('app.providers.calendar.day');
  const place = t('app.providers.calendar.place');
  const specials = t('app.providers.calendar.special');
  const title_meeting = t('app.providers.calendar.title_meeting');
  const weeks = t('app.providers.calendar.week');

  // Définition individuelle des jours
  const monday = t('app.providers.calendar.monday');
  const tuesday = t('app.providers.calendar.tuesday');
  const wednesday = t('app.providers.calendar.wednesday');
  const thursday = t('app.providers.calendar.thursday');
  const friday = t('app.providers.calendar.friday');
  const saturday = t('app.providers.calendar.saturday');
  const sunday = t('app.providers.calendar.sunday');

  // Pour le stockage interne, on garde les clés
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Fonction de traduction simplifiée
  function translateDay(key: string): string {
  switch(key) {
    case 'monday': return get(monday);
    case 'tuesday': return get(tuesday);
    case 'wednesday': return get(wednesday);
    case 'thursday': return get(thursday);
    case 'friday': return get(friday);
    case 'saturday': return get(saturday);
    case 'sunday': return get(sunday);
    default: return key;
    }
  }

  // Heures
  const hours: string[] = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 8;
    return hour === 24 ? '00h' : `${hour}h`;
  });

  // Types
  interface Appointment {
    id: string;
    day: string; // stocke la clé (ex: 'monday')
    hour: string;
    title: string;
    location?: string;
    special?: boolean;
  }

  // États
  let currentWeek = 12;
  let appointments: Appointment[] = [];
  let selectedAppointment: Appointment | null = null;
  let showModal = false;
  let loading = true;

  let showAddModal = false;
  let newAppointment: Appointment;

  // Ajout de RDV
  function openAddModal() {
    showAddModal = true;
    newAppointment = {
      id: crypto.randomUUID(),
      day: 'monday', // utilise directement la clé
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
  }

  // Simulation API
  async function fetchAppointments(week: number): Promise<Appointment[]> {
    loading = true;
    await new Promise((res) => setTimeout(res, 300));

    const mockData: Appointment[] = [
      { id: '1', day: 'monday', hour: '8h', title: 'Jardinage et élagage' },
      { id: '2', day: 'monday', hour: '9h', title: 'Jardinage', location: 'Lyon' },
      { id: '3', day: 'tuesday', hour: '21h', title: 'Arrosage', special: true },
      { id: '4', day: 'friday', hour: '00h', title: 'Intervention de nuit', location: 'Paris' }
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
        <h1 class="text-xl font-author">{$weeks} {currentWeek}</h1>
        <button on:click={nextWeek} class="btn btn-circle btn-sm btn-outline">→</button>
      </div>
      <button class="btn btn-primary" on:click={openAddModal}>{$add}</button>
    </div>

    <!-- Calendrier -->
    {#if loading}
      <p class="text-center text-gray-500">Chargement des rendez-vous...</p>
    {:else}
      <div class="overflow-x-auto border border-base-300 rounded-lg">
        <table class="table table-zebra w-full">
          <thead class="bg-base-200 text-base font-author">
            <tr>
              <th class="bg-base-200 text-right">{$times}</th>
              <th class="text-center">{$monday}</th>
              <th class="text-center">{$tuesday}</th>
              <th class="text-center">{$wednesday}</th>
              <th class="text-center">{$thursday}</th>
              <th class="text-center">{$friday}</th>
              <th class="text-center">{$saturday}</th>
              <th class="text-center">{$sunday}</th>
            </tr>
          </thead>
          <tbody>
            {#each hours as hour}
              <tr class="hover:bg-base-100 transition">
                <td class="text-right font-author bg-base-100">{hour}</td>
                {#each dayKeys as dayKey}
                  <td class="min-h-16 min-w-32 align-top border border-base-300">
                    {#each appointments.filter(a => a.day === dayKey && a.hour === hour) as appointment}
                      <div
                        on:click={() => handleAppointmentClick(appointment)}
                        class={`mb-1 p-2 text-sm rounded cursor-pointer shadow-sm
                          ${appointment.special
                            ? 'bg-accent text-accent-content'
                            : 'bg-primary text-primary-content'}`}
                      >
                        <div class="font-author">{appointment.title}</div>
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
        <h3 class="font-author text-lg">{selectedAppointment.title}</h3>
        {#if selectedAppointment.location}
          <p class="py-2">📍 {selectedAppointment.location}</p>
        {/if}
        <p class="py-2">🗓 {translateDay(selectedAppointment.day)} à {selectedAppointment.hour}</p>

        <div class="modal-action flex flex-col gap-2">
          <button on:click={() => alert('Conversation ouverte')} class="btn btn-primary w-full">
            Afficher la conversation
          </button>
          <button on:click={cancelAppointment} class="btn btn-error w-full">
            {$cancel}
          </button>
          <button on:click={() => (showModal = false)} class="btn btn-ghost w-full">
            {$cancel}
          </button>
        </div>
      </div>
    </dialog>
  {/if}

  <!-- Modal : Ajout -->
  {#if showAddModal}
    <dialog class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-author text-lg mb-2">{$title_meeting}</h3>

        <div class="form-control mb-2">
          <label class="label">
            <span class="label-text">{$titles}</span>
          </label>
          <input type="text" bind:value={newAppointment.title} class="input input-bordered" />
        </div>

        <div class="form-control mb-2">
          <label class="label">
            <span class="label-text">{$dayy}</span>
          </label>
          <select bind:value={newAppointment.day} class="select select-bordered">
            <option value="monday">{monday}</option>
            <option value="tuesday">{tuesday}</option>
            <option value="wednesday">{wednesday}</option>
            <option value="thursday">{thursday}</option>
            <option value="friday">{friday}</option>
            <option value="saturday">{saturday}</option>
            <option value="sunday">{sunday}</option>
          </select>
        </div>

        <div class="form-control mb-2">
          <label class="label">
            <span class="label-text">{$times}</span>
          </label>
          <select bind:value={newAppointment.hour} class="select select-bordered">
            {#each hours as h}
              <option value={h}>{h}</option>
            {/each}
          </select>
        </div>

        <div class="form-control mb-2">
          <label class="label">
            <span class="label-text">{$place}</span>
          </label>
          <input type="text" bind:value={newAppointment.location} class="input input-bordered" />
        </div>

        <div class="form-control mb-4">
          <label class="cursor-pointer label justify-start gap-2">
            <input type="checkbox" class="checkbox" bind:checked={newAppointment.special} />
            <span class="label-text">{$specials}</span>
          </label>
        </div>

        <div class="modal-action flex flex-col gap-2">
          <button on:click={addAppointment} class="btn btn-primary w-full">
            {$add}
          </button>
          <button on:click={() => (showAddModal = false)} class="btn btn-error w-full">
            {$cancel}
          </button>
        </div>
      </div>
    </dialog>
  {/if}
</div>