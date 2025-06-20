<script lang="ts">
  import { writable } from 'svelte/store';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import AccountMenu from './AccountMenu.svelte';

  export let groups: { group: string; items: { name: string; url: string }[] }[] = [];
  export let currentUrl: string = '';
  export let isOpen = writable(false);
</script>

<nav class="top-0 left-0 z-50 w-full px-6 pt-4">
  <div class="container mx-auto flex w-full items-center justify-between py-3">
    <a href="/app"><img src="/images/logo/ecodeli-light.png" alt="Logo" class="h-8 w-auto" /></a>

    <!-- Mobile burger -->
    <div class="flex items-center lg:hidden">
      <button
        class="btn btn-ghost"
        on:click={() => isOpen.update((value) => !value)}
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
    </div>

    <!-- Desktop menu -->
    <div class="ml-auto hidden items-center space-x-6 lg:flex">
      {#each groups as groupBlock}
        <div class="relative group">
          <button class="font-semibold text-gray-800 px-3 py-2 rounded hover:bg-gray-100 flex items-center">
            {groupBlock.group}
            <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div class="absolute left-0 top-full z-10 hidden min-w-[180px] rounded bg-white py-2 shadow-lg group-hover:block group-focus-within:block">
            {#each groupBlock.items as page}
              <a
                href={page.url}
                class="block px-4 py-2 text-gray-800 hover:bg-primary hover:text-white transition-colors {currentUrl === page.url ? 'bg-primary text-white' : ''}"
              >
                {page.name}
              </a>
            {/each}
          </div>
        </div>
      {/each}
      <AccountMenu />
      <LanguageSwitcher />
    </div>
  </div>
</nav>

{#if $isOpen}
  <button
    type="button"
    class="bg-opacity-50 fixed inset-0 transition-opacity duration-300"
    aria-label="Close menu"
    on:click={() => isOpen.set(false)}
    on:keydown={(e) => e.key === 'Enter' && isOpen.set(false)}
  >
  </button>
{/if}

<!-- Mobile menu -->
<div
  class="bg-base-100 fixed top-0 right-0 z-50 h-full w-64 transform shadow-lg transition-transform duration-300 ease-in-out {$isOpen ? 'translate-x-0' : 'translate-x-full'}"
>
  <div class="flex flex-col space-y-4 p-6">
    <button class="btn btn-ghost self-end" on:click={() => isOpen.set(false)}> ✕ </button>
    {#each groups as groupBlock}
      <details>
        <summary class="font-semibold text-gray-800 px-3 py-2 rounded hover:bg-gray-100 cursor-pointer flex items-center">
          {groupBlock.group}
          <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </summary>
        <ul class="pl-4">
          {#each groupBlock.items as page}
            <li>
              <a
                href={page.url}
                class="block px-4 py-2 text-gray-800 hover:bg-primary hover:text-white transition-colors {currentUrl === page.url ? 'bg-primary text-white' : ''}"
              >
                {page.name}
              </a>
            </li>
          {/each}
        </ul>
      </details>
    {/each}
    <hr class="border-gray-100" />
    <AccountMenu />
    <LanguageSwitcher />
  </div>
</div>

<style>
  .group:hover .group-hover\:block,
  .group:focus-within .group-hover\:block {
    display: block;
  }
  .group-hover\:block {
    display: none;
  }
</style> 