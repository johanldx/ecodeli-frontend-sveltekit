<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { fetchFromAPI } from '$lib/utils/api';
  import { currentLang, translationsReady } from '$lib/stores/i18n';

  const availableLangs = writable<string[]>([]);
  const dropdownOpen = writable(false);

  onMount(async () => {
    const langs = await fetchFromAPI<string[]>('/langs');
    availableLangs.set(langs);
  });

  function flag(code: string): string {
    return code
      .toUpperCase()
      .replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397));
  }

  async function switchLang(code: string) {
    if (code === $currentLang) return;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', code);
    }

    currentLang.set(code); // Déclenche le rechargement dans TranslationProvider
  }

  // Fermer le menu quand les traductions sont prêtes après changement
  $: if ($translationsReady && $dropdownOpen) {
    dropdownOpen.set(false);
  }
</script>

<div class="dropdown dropdown-end" class:dropdown-open={$dropdownOpen}>
  <button
    type="button"
    class="btn"
    on:click={() => dropdownOpen.set(!$dropdownOpen)}
    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && dropdownOpen.set(!$dropdownOpen)}
  >
    <span class="text-xl">{flag($currentLang)}</span>
    <svg class="ml-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
    {#each $availableLangs as code}
      <li>
        <button on:click={() => switchLang(code)} class="flex items-center gap-2">
          <span class="text-lg">{flag(code)}</span>
          <span class="uppercase text-sm">{code}</span>
        </button>
      </li>
    {/each}
  </ul>
</div>
