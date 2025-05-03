<script lang="ts">
    interface Conversation {
      id: number;
      participantName: string;
      subtitle?: string;
    }
    interface Ad {
        title: string;
        description: string;
        price: number;
        type: 'delivery' | 'shopping' | 'service';
        offerPrice?: number;
    }

    interface Message {
      id: number;
      role: 'user' | 'other' | 'system';
      text: string;
      senderName?: string;
    }
  
    let convList: Conversation[] = [
      { id: 1, participantName: 'Vincent Juillet' },
      { id: 2, participantName: 'Charles Leclerc', subtitle: 'Transport à l’aéroport' },
      { id: 3, participantName: 'Bob Alice', subtitle: 'Jardinage' },
      // …
    ];
    let selectedConv: Conversation = convList[0];
  
    let ad: Ad = {
    title: 'Titre de l’annonce',
    description: 'Description de l’annonce…',
    price: 140,
    type: 'delivery',      // ou 'shopping', ou 'service'
    offerPrice: 120        // seulement pour delivery & shopping
    };
  
    let messages: Message[] = [
      { id: 1, role: 'other', text: 'Bonjour, j’aimerais m’occuper de votre canapé', senderName: selectedConv.participantName },
      { id: 2, role: 'user',  text: 'Bonjour ! Faites-moi une proposition', senderName: 'Vous' },
      { id: 3, role: 'system', text: 'Voir la proposition à 163 €', senderName: 'Notification automatique' }
    ];
  
    let newMessage = '';
  
    function selectConv(conv: Conversation) {
      selectedConv = conv;
      // TODO: charger ad & messages depuis API
      newMessage = '';
    }
  
    function send() {
      if (!newMessage.trim()) return;
      messages = [
        ...messages,
        { id: messages.length + 1, role: 'user', text: newMessage, senderName: 'Vous' }
      ];
      newMessage = '';
      // TODO: POST vers l’API
    }

    let showSlotModal = false;

function openSlotModal() {
  showSlotModal = true;
}

function closeSlotModal() {
  showSlotModal = false;
}
  </script>

  <div class="h-screen">
    <div class="mt-20 flex h-[70vh] border-2 border-gray-300 rounded-2xl overflow-hidden">
        <!-- Sidebar desktop -->
        <aside class="hidden md:flex flex-col w-64 bg-white border-r border-gray-300 rounded-l-lg overflow-hidden">
          <ul class="flex-1 overflow-y-auto">
            {#each convList as conv}
              <button
                type="button"
                on:click={() => selectConv(conv)}
                class="flex items-center p-3 text-left w-full hover:bg-gray-200 border-b border-gray-200 {selectedConv.id === conv.id ? 'bg-base-100' : ''}"
              >
                <div class="h-8 w-1 bg-green-500 rounded mr-3"></div>
                <div class="flex flex-col">
                  <span class="font-semibold">{conv.participantName}</span>
                  {#if conv.subtitle}
                    <small class="text-xs text-gray-500">{conv.subtitle}</small>
                  {/if}
                </div>
              </button>
            {/each}
          </ul>
        </aside>
      
        <div class="flex flex-col flex-1 border-gray-300 rounded-r-lg">
          <!-- Mobile selector -->
          <div class="md:hidden bg-white border-b border-gray-300 p-2">
            <select
              bind:value={selectedConv.id}
              class="select select-bordered w-full"
              on:change={() => selectConv(convList.find(c => c.id === +selectedConv.id) ?? convList[0])}
            >
              {#each convList as conv}
                <option value={conv.id}>{conv.participantName}</option>
              {/each}
            </select>
          </div>
      
          <!-- Récap annonce -->
          <header class="flex justify-between items-start p-4 bg-white border-b border-gray-300">
            <div>
                <div class="flex items-center space-x-2 mb-2">
                    <button class="badge badge-neutral">Mon annonce</button>
                    <span class="badge badge-secondary">{ad.price} €</span>
                  </div>
              <h2 class="font-bold text-lg">{ad.title}</h2>
              <p class="text-sm text-gray-600">{ad.description}</p>
            </div>
          
            {#if ad.type === 'delivery' || ad.type === 'shopping'}
              <!-- badge Mon annonce + prix -->
              <!-- bouton d’action Accepter l’offre -->
              <button class="btn btn-primary ml-4">
                Accepter l’offre de {ad.offerPrice} €
              </button>
          
            {:else if ad.type === 'service'}
              <!-- pas de badge prix, juste le bouton de créneau -->
              <button class="btn btn-primary" on:click={openSlotModal}>
                Choisir un créneau
              </button>
            {/if}
          </header>
          
      
          <!-- Messages -->
          <main class="flex-1 overflow-y-auto p-4 bg-white space-y-4">
            {#each messages as m}
              {#if m.role === 'system'}
                <div class="chat chat-center">
                  <div class="chat-header text-xs text-gray-500">{m.senderName}</div>
                  <div class="chat-bubble bg-base-content text-white">
                    {m.text}
                  </div>
                </div>
              {:else if m.role === 'user'}
                <div class="chat chat-end">
                  <div class="chat-header text-xs text-gray-500">{m.senderName}</div>
                  <div class="chat-bubble bg-primary">
                    {m.text}
                  </div>
                </div>
              {:else}
                <div class="chat chat-start">
                  <div class="chat-header text-xs text-gray-500">{m.senderName}</div>
                  <div class="chat-bubble bg-gray-300">
                    {m.text}
                  </div>
                </div>
              {/if}
            {/each}
          </main>
      
          <!-- Input -->
          <footer class="p-4 bg-white border-t border-gray-300">
            <div class="flex">
              <input
                type="text"
                bind:value={newMessage}
                placeholder="Tapez un message…"
                class="input input-bordered flex-1"
                on:keydown={(e) => e.key === 'Enter' && send()}
              />
              <button class="btn btn-primary ml-2" on:click={send}>→</button>
            </div>
          </footer>
        </div>
      </div>
  </div>

  {#if showSlotModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Choisir un créneau</h3>
      <!-- Ici ton contenu de sélection de créneau… -->
      <div class="modal-action">
        <button class="btn" on:click={closeSlotModal}>Annuler</button>
        <button class="btn btn-primary" on:click={() => {
          /* valider le créneau */
          closeSlotModal();
        }}>
          Confirmer
        </button>
      </div>
    </div>
  </div>
{/if}

  
  <style>
    /* Mark selected conversation */
    li.bg-base-100 > div > span {
      @apply text-primary;
    }
  </style>
  