<script lang="ts">
    import { writable } from 'svelte/store';
    import LanguageSwitcher from './LanguageSwitcher.svelte';
	import AccountMenu from './AccountMenu.svelte';

    export let pages: { name: string, url: string }[] = [];
    export let isOpen = writable(false);
    export const dropdownOpen = writable(false);

</script>

<nav class="top-0 left-0 w-full z-50 px-6 pt-4">
    <div class="container mx-auto flex justify-between items-center w-full py-3">
        <a href="/app"><img src="/images/logo/ecodeli-light.png" alt="Logo" class="h-8 w-auto"></a>

        <div class="lg:hidden flex items-center ">
            <button class="btn btn-ghost" onclick={() => isOpen.update(value => !value)} aria-label="Toggle menu">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7"/>
                </svg>
            </button>
        </div>

        <div class="hidden lg:flex items-center space-x-6 ml-auto">
            {#each pages as page}
                <a href={page.url} class="relative transition duration-200 ease-in-out after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full">
                    {page.name}
                </a>
            {/each}

            <AccountMenu />

            <LanguageSwitcher />

        </div>
    </div>
</nav>

{#if $isOpen}
    <button 
        type="button"
        class="fixed inset-0 bg-opacity-50 transition-opacity duration-300"
        aria-label="Close menu"
        onclick={() => isOpen.set(false)}
        onkeydown={(e) => e.key === 'Enter' && isOpen.set(false)}>
    </button>
{/if}

<div 
    class="fixed top-0 right-0 h-full w-64 bg-base-100 shadow-lg transform transition-transform duration-300 ease-in-out z-50 { $isOpen ? 'translate-x-0' : 'translate-x-full' }">

    <div class="flex flex-col p-6 space-y-4">
        <button class="btn btn-ghost self-end" onclick={() => isOpen.set(false)}>
            ✕
        </button>

        {#each pages as page}
            <a href={page.url} class="relative transition duration-200 ease-in-out after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full">
                {page.name}
            </a>
        {/each}

        <hr class="border-gray-100">

        <AccountMenu />
        <LanguageSwitcher />
    </div>
</div>
