<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';

  // Props
  export let carImage = '/images/game/voiture.png';
  export let truckImage = '/images/game/camion.png';
  export let backgroundImage = '/images/game/background.png';

  // Game state
  let score = writable(0);
  let gameActive = writable(false);
  let showGame = writable(false);
  let showRules = writable(false);
  let timeLeft = writable(20);
  let vehicles: Vehicle[] = [];
  let gameInterval: number;
  let vehicleInterval: number;
  let timeInterval: number;

  interface Vehicle {
    id: number;
    type: 'car' | 'truck';
    x: number;
    y: number;
    speed: number;
    width: number;
    height: number;
    direction: 'diagonal1' | 'diagonal2' | 'diagonal3' | 'diagonal4'; // 4 diagonales différentes
  }

  // Game settings
  const GAME_DURATION = 20;
  const VEHICLE_SPAWN_RATE = 800; // ms - Plus de véhicules
  const BASE_VEHICLE_SPEED = 2;
  const VEHICLE_WIDTH = 80; // Plus gros
  const VEHICLE_HEIGHT = 60; // Plus gros
  const SCREEN_SIZE = 600; // Carré
  const COLLISION_DISTANCE = 100; // Distance pour détecter une collision

  function showGameRules() {
    $showRules = true;
  }

  function startGame() {
    $showRules = false;
    $showGame = true;
    $gameActive = true;
    $score = 0;
    $timeLeft = GAME_DURATION;
    vehicles = [];

    // Spawn vehicles
    vehicleInterval = setInterval(() => {
      if ($gameActive) {
        spawnVehicle();
      }
    }, VEHICLE_SPAWN_RATE);

    // Update time
    timeInterval = setInterval(() => {
      if ($gameActive) {
        $timeLeft--;
        if ($timeLeft <= 0) {
          endGame();
        }
      }
    }, 1000);

    // Game loop
    gameInterval = setInterval(() => {
      if ($gameActive) {
        updateVehicles();
      }
    }, 16); // ~60 FPS
  }

  function endGame() {
    $gameActive = false;
    clearInterval(vehicleInterval);
    clearInterval(timeInterval);
    clearInterval(gameInterval);
  }

  function closeGame() {
    $showGame = false;
    $showRules = false;
    $gameActive = false;
    clearInterval(vehicleInterval);
    clearInterval(timeInterval);
    clearInterval(gameInterval);
    vehicles = [];
  }

  function spawnVehicle() {
    const type = Math.random() < 0.5 ? 'car' : 'truck';
    const direction = Math.random() < 0.25 ? 'diagonal1' : 
                     Math.random() < 0.5 ? 'diagonal2' : 
                     Math.random() < 0.75 ? 'diagonal3' : 'diagonal4';
    
    let x, y;
    switch (direction) {
      case 'diagonal1': // Haut-gauche vers bas-droite
        x = -VEHICLE_WIDTH;
        y = -VEHICLE_HEIGHT;
        break;
      case 'diagonal2': // Bas-gauche vers haut-droite
        x = -VEHICLE_WIDTH;
        y = SCREEN_SIZE;
        break;
      case 'diagonal3': // Haut-droite vers bas-gauche
        x = SCREEN_SIZE;
        y = -VEHICLE_HEIGHT;
        break;
      case 'diagonal4': // Bas-droite vers haut-gauche
        x = SCREEN_SIZE;
        y = SCREEN_SIZE;
        break;
    }

    const vehicle: Vehicle = {
      id: Date.now() + Math.random(),
      type,
      x,
      y,
      speed: BASE_VEHICLE_SPEED + Math.random() * 1.5,
      width: VEHICLE_WIDTH,
      height: VEHICLE_HEIGHT,
      direction
    };
    vehicles = [...vehicles, vehicle];
  }

  function updateVehicles() {
    // Mettre à jour les positions
    vehicles = vehicles.map(vehicle => {
      let newX, newY;
      
      switch (vehicle.direction) {
        case 'diagonal1': // Haut-gauche vers bas-droite
          newX = vehicle.x + vehicle.speed;
          newY = vehicle.y + vehicle.speed;
          break;
        case 'diagonal2': // Bas-gauche vers haut-droite
          newX = vehicle.x + vehicle.speed;
          newY = vehicle.y - vehicle.speed;
          break;
        case 'diagonal3': // Haut-droite vers bas-gauche
          newX = vehicle.x - vehicle.speed;
          newY = vehicle.y + vehicle.speed;
          break;
        case 'diagonal4': // Bas-droite vers haut-gauche
          newX = vehicle.x - vehicle.speed;
          newY = vehicle.y - vehicle.speed;
          break;
      }

      return {
        ...vehicle,
        x: newX,
        y: newY
      };
    }).filter(vehicle => {
      // Supprimer les véhicules seulement quand ils ont complètement quitté l'image
      switch (vehicle.direction) {
        case 'diagonal1': // Haut-gauche vers bas-droite
          return !(vehicle.x > SCREEN_SIZE + VEHICLE_WIDTH && vehicle.y > SCREEN_SIZE + VEHICLE_HEIGHT);
        case 'diagonal2': // Bas-gauche vers haut-droite
          return !(vehicle.x > SCREEN_SIZE + VEHICLE_WIDTH && vehicle.y < -VEHICLE_HEIGHT);
        case 'diagonal3': // Haut-droite vers bas-gauche
          return !(vehicle.x < -VEHICLE_WIDTH && vehicle.y > SCREEN_SIZE + VEHICLE_HEIGHT);
        case 'diagonal4': // Bas-droite vers haut-gauche
          return !(vehicle.x < -VEHICLE_WIDTH && vehicle.y < -VEHICLE_HEIGHT);
        default:
          return true;
      }
    });
  }

  function shootVehicle(vehicle: Vehicle) {
    if (!$gameActive) return;

    if (vehicle.type === 'truck') {
      // Correct: shot a truck
      $score++;
    } else {
      // Wrong: shot a car
      $score--;
    }

    // Remove vehicle
    vehicles = vehicles.filter(v => v.id !== vehicle.id);
  }

  function letVehiclePass(vehicle: Vehicle) {
    if (!$gameActive) return;

    if (vehicle.type === 'car') {
      // Correct: let car pass
      $score++;
    } else {
      // Wrong: let truck pass
      $score--;
    }

    // Remove vehicle
    vehicles = vehicles.filter(v => v.id !== vehicle.id);
  }

  onDestroy(() => {
    clearInterval(vehicleInterval);
    clearInterval(timeInterval);
    clearInterval(gameInterval);
  });
</script>

<!-- Fixed button in bottom right -->
<button 
  class="fixed bottom-6 right-6 btn btn-primary btn-circle btn-lg shadow-lg hover:scale-110 transition-transform duration-200 z-50"
  on:click={showGameRules}
  title="Jouer au jeu de tir"
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
  </svg>
</button>

<!-- Rules overlay -->
{#if $showRules}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md mx-4 p-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
          </svg>
        </div>
        
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Jeu de Tir de Véhicules</h3>
        
        <div class="space-y-4 mb-8">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-600 font-bold">✓</span>
            </div>
            <div class="text-left">
              <p class="font-medium text-gray-900">Tirez sur les camions</p>
              <p class="text-sm text-gray-600">Livreurs professionnels</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-bold">✓</span>
            </div>
            <div class="text-left">
              <p class="font-medium text-gray-900">Laissez passer les voitures</p>
              <p class="text-sm text-gray-600">Particuliers</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button class="btn btn-outline flex-1" on:click={() => $showRules = false}>
            Annuler
          </button>
          <button class="btn btn-primary flex-1" on:click={startGame}>
            Commencer
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Game overlay -->
{#if $showGame}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]">
    <div class="relative w-full h-full flex items-center justify-center">
      <!-- Close button -->
      <button 
        class="absolute top-6 right-6 btn btn-circle btn-ghost text-white hover:bg-white/20"
        on:click={closeGame}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {#if !$gameActive && $timeLeft === 0}
        <!-- Game over screen -->
        <div class="bg-white rounded-2xl shadow-2xl max-w-md mx-4 p-8 text-center">
          <div class="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-warning">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Partie terminée</h2>
          <p class="text-3xl font-bold text-warning mb-8">Score: {$score}</p>
          
          <div class="flex gap-3">
            <button class="btn btn-outline flex-1" on:click={closeGame}>Fermer</button>
            <button class="btn btn-primary flex-1" on:click={startGame}>Rejouer</button>
          </div>
        </div>
      {:else}
        <!-- Game screen -->
        <div class="text-center">
          <div class="flex justify-between items-center mb-6 text-lg font-semibold text-white max-w-2xl mx-auto">
            <div class="bg-success/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              Score: {$score}
            </div>
            <div class="bg-error/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              Temps: {$timeLeft}s
            </div>
          </div>
          
          <div 
            class="relative border-2 border-white/30 rounded-xl overflow-hidden mx-auto"
            style="width: {SCREEN_SIZE}px; height: {SCREEN_SIZE}px;"
          >
            <!-- Background image -->
            <img 
              src={backgroundImage} 
              alt="Game background"
              class="absolute inset-0 w-full h-full object-cover"
            />
            
            <!-- Vehicles -->
            {#each vehicles as vehicle (vehicle.id)}
              <div 
                class="absolute cursor-pointer transition-all duration-200 rounded-lg hover:scale-110 {vehicle.type === 'car' ? 'drop-shadow-lg drop-shadow-green-500' : 'drop-shadow-lg drop-shadow-red-500'}"
                style="left: {vehicle.x}px; top: {vehicle.y}px; width: {vehicle.width}px; height: {vehicle.height}px;"
                on:click={() => shootVehicle(vehicle)}
                on:contextmenu|preventDefault={() => letVehiclePass(vehicle)}
              >
                <img 
                  src={vehicle.type === 'car' ? carImage : truckImage} 
                  alt={vehicle.type}
                  class="w-full h-full object-contain"
                />
              </div>
            {/each}
          </div>

          <div class="mt-6 p-4 bg-white/90 backdrop-blur-sm rounded-lg text-sm max-w-md mx-auto">
            <div class="flex justify-center items-center gap-6 text-gray-700">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Clic gauche: Tirer</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Clic droit: Laisser passer</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if} 