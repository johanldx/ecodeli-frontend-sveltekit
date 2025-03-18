<script>
    let isOpen = false;
</script>
    
<nav class="top-0 left-0 w-full z-50 px-6 pt-4">
    <div class="container mx-auto flex justify-between items-center w-full py-3">
        
        <div class="absolute left-1/2 transform -translate-x-1/2">
        <img src="/images/logo/ecodeli-light.png" alt="Logo" class="h-8 w-auto">
        </div>

        <div class="md:hidden flex items-center mr-auto">
        <button class="btn btn-ghost" on:click={() => isOpen = !isOpen} aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7"/>
            </svg>
        </button>
        </div>

        <div class="hidden md:flex items-center space-x-6 ml-auto">
            <a href="/register" class="relative transition duration-200 ease-in-out after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full">
                S’inscrire
            </a>
            <a href="/login" class="relative transition duration-200 ease-in-out after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full">
                Se connecter
            </a>
        </div>
    </div>
</nav>

{#if isOpen}
    <button 
        type="button"
        class="fixed inset-0 bg-opacity-50 transition-opacity duration-300"
        aria-label="Close menu"
        on:click={() => isOpen = false}
        on:keydown={(e) => e.key === 'Enter' && (isOpen = false)}>
    </button>
{/if}

<div 
    class="fixed top-0 right-0 h-full w-64 bg-base-100 shadow-lg transform transition-transform duration-300 ease-in-out z-50"
    class:translate-x-0={isOpen}
    class:translate-x-full={!isOpen}>

    <div class="flex flex-col p-6 space-y-4">
        <button class="btn btn-ghost self-end" on:click={() => isOpen = false}>
        ✕
        </button>
        <a href="/register" class="relative transition duration-200 ease-in-out after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full">
            S’inscrire
        </a>
        <a href="/login" class="relative transition duration-200 ease-in-out after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full">
            Se connecter
        </a>
    </div>
</div>