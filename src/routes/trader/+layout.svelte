<script lang="ts">
    import '../../app.css';
    let { children } = $props();
    </script>
    
    <div class="min-h-screen bg-[#FEFCF3]" data-theme="ecodeli">
      
      <!-- HEADER / NAVBAR -->
      <header class="navbar bg-[#FEFCF3] px-4 sm:px-8 py-4">
        
        <!-- Logo / Nom de l'application -->
        <div class="navbar-start w-1/3">
          <a href="/" class="flex items-center">
            <img src="/images/logo/ecodeli-light.png" alt="EcoDeli" class="h-8 w-auto">
          </a>
        </div>
      
        <!-- Conteneur pour le menu et l'avatar à droite -->
        <div class="navbar-end flex items-center w-2/3">
          <!-- Menu de navigation pour les écrans larges -->
          <div class="hidden lg:flex overflow-hidden">
            <ul class="menu menu-horizontal px-1 whitespace-nowrap space-x-4">
            <li><a href="/clients/mes-conversations">Mes conversations</a></li>
            <li><a href="/clients/mes-annonces">Mes demandes</a></li>
            <li><a href="/clients/mon-compte">Mon compte</a></li>
            </ul>
          </div>
          
          <!-- Menu déroulant pour les petits écrans -->
          <div class="dropdown dropdown-end lg:hidden">
            <!-- Bouton du menu déroulant -->
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <!-- Contenu du menu déroulant -->
            <ul tabindex="0" class="menu menu-sm dropdown-content mt-2 z-[1] p-2 shadow bg-base-100 rounded-box w-52 absolute right-0">
              <li><a href="/decouvrir">Découvrir</a></li>
              <li><a href="/clients/mes-conversations">Mes conversations</a></li>
              <li><a href="/clients/mes-annonces">Mes annonces</a></li>
              <li><a href="/clients/mon-compte">Mon compte</a></li>
            </ul>
          </div>
          
          <!-- Avatar utilisateur -->
          <div class="avatar placeholder ml-4">
            <div class="bg-accent text-accent-content rounded-full w-10 h-10">
              <span>JD</span>
            </div>
          </div>
        </div>
      
      </header>
    
      {@render children()}
      
    </div>