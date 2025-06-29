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
		<span class="text-sm uppercase font-medium">{$currentLang}</span>
		<svg
			class="ml-2 h-4 w-4"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow">
		{#each $availableLangs as code}
			<li>
				<button on:click={() => switchLang(code)} class="flex items-center justify-center py-2">
					<span class="text-sm uppercase font-medium">{code}</span>
				</button>
			</li>
		{/each}
	</ul>
</div>
