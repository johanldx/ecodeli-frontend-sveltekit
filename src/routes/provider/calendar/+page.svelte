<script lang="ts">
    import { onMount } from 'svelte';
  
    // Configuration du calendrier
    let currentWeek: number = 12;
    const days: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const hours: string[] = ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h'];
  
    // Type pour les rendez-vous
    interface Appointment {
      id: string;
      day: string;
      hour: string;
      title: string;
      location?: string;
      special?: boolean;
    }
  
    // Données des rendez-vous
    const appointments: Appointment[] = [
      { id: '1', day: 'Lundi', hour: '8h', title: 'Jardinage et élagage' },
      { id: '2', day: 'Lundi', hour: '9h', title: 'Jardinage et élagage' },
      { id: '3', day: 'Lundi', hour: '10h', title: 'Jardinage et élagage' },
      { id: '4', day: 'Mardi', hour: '8h', title: 'Jardinage et élagage', location: 'Paris', special: true },
    ];
  
    // État pour gérer les interactions
    let selectedAppointment: Appointment | null = null;
    let showModal: boolean = false;
  
    // Fonctions de navigation
    const prevWeek = () => currentWeek--;
    const nextWeek = () => currentWeek++;
  
    // Gestion des rendez-vous
    const handleAppointmentClick = (appointment: Appointment) => {
      selectedAppointment = appointment;
      showModal = true;
    };
  
    const cancelAppointment = () => {
      if (selectedAppointment) {
        alert(`Rendez-vous annulé: ${selectedAppointment.title}`);
        showModal = false;
      }
    };
  </script>
  
  <div class="p-6 bg-base-100 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- En-tête avec navigation -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <button on:click={prevWeek} class="btn btn-circle btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <h1 class="text-xl font-bold">Semaine {currentWeek}</h1>
          <button on:click={nextWeek} class="btn btn-circle btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <button class="btn btn-primary">Ajouter</button>
      </div>
  
      <!-- Calendrier -->
      <div class="overflow-x-auto">
        <table class="table w-full bg-base-100 border border-base-200">
          <!-- En-têtes des jours -->
          <thead>
            <tr>
              <th class="bg-base-200"></th>
              {#each days as day}
                <th class="bg-base-200 text-center">{day}</th>
              {/each}
            </tr>
          </thead>
          
          <tbody>
            {#each hours as hour}
              <tr>
                <td class="bg-base-200 text-right pr-4">{hour}</td>
                
                {#each days as day}
                  <td class="border border-base-200 p-1 min-h-16 min-w-32 relative">
                    {#each appointments.filter(a => a.day === day && a.hour === hour) as appointment}
                      <div
                        on:click={() => handleAppointmentClick(appointment)}
                        class={`p-2 text-xs rounded cursor-pointer 
                          ${appointment.special ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}
                      >
                        {appointment.title}
                        {#if appointment.location}
                          <div class="text-xs opacity-80">({appointment.location})</div>
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
    </div>
  
    <!-- Modal pour les actions -->
    {#if showModal && selectedAppointment}
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg">{selectedAppointment.title}</h3>
          {#if selectedAppointment.location}
            <p class="py-2">Lieu: {selectedAppointment.location}</p>
          {/if}
          <p class="py-2">Jour: {selectedAppointment.day} à {selectedAppointment.hour}</p>
          
          <div class="modal-action flex flex-col gap-2">
            <button on:click={() => alert('Conversation affichée')} class="btn btn-primary w-full">
              Afficher la conversation
            </button>
            <button on:click={cancelAppointment} class="btn btn-error w-full">
              Annuler le rendez-vous
            </button>
            <button on:click={() => showModal = false} class="btn btn-ghost w-full">
              Fermer
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>