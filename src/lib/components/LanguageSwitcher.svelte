<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { fetchFromAPI } from '$lib/utils/api';
	import { currentLang, translationsReady } from '$lib/stores/i18n';

	const availableLangs = writable<string[]>([]);
	const dropdownOpen = writable(false);
	let dropdownRef: HTMLDivElement | null = null;

	onMount(async () => {
		const langs = await fetchFromAPI<string[]>('/langs');
		availableLangs.set(langs);
	});

	function flag(code: string): string {
		return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397));
	}

	async function switchLang(code: string) {
		if (code === $currentLang) return;

		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('lang', code);
		}

		currentLang.set(code); // Déclenche le rechargement dans TranslationProvider
		dropdownOpen.set(false); // Fermer le dropdown après sélection
	}

	function toggleDropdown() {
		dropdownOpen.update(value => !value);
	}

	// Fermer le dropdown en cliquant à l'extérieur
	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			dropdownOpen.set(false);
		}
	}

	// Fermer le dropdown en touchant à l'extérieur
	function handleTouchOutside(event: TouchEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			dropdownOpen.set(false);
		}
	}

	// Gestion des événements tactiles
	function handleTouchStart(event: TouchEvent) {
		event.preventDefault();
		toggleDropdown();
	}

	// Fermer le menu quand les traductions sont prêtes après changement
	$: if ($translationsReady && $dropdownOpen) {
		dropdownOpen.set(false);
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('touchstart', handleTouchOutside);
	});

	onMount(() => {
		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('touchstart', handleTouchOutside);
		};
	});
</script>

<div class="dropdown dropdown-end relative" class:dropdown-open={$dropdownOpen} bind:this={dropdownRef}>
	<button
		type="button"
		class="btn"
		on:click={toggleDropdown}
		on:touchstart={handleTouchStart}
		on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleDropdown()}
		aria-label="Changer de langue"
		aria-expanded={$dropdownOpen}
		aria-haspopup="true"
	>
		<span class="text-xl">{flag($currentLang)}</span>
		<svg
			class="ml-2 h-4 w-4 transition-transform duration-200"
			class:rotate-180={$dropdownOpen}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if $dropdownOpen}
		<ul class="dropdown-content menu bg-base-100 rounded-box z-[9999] w-40 p-2 shadow-lg border border-base-300">
			{#each $availableLangs as code}
				<li>
					<button 
						on:click={() => switchLang(code)} 
						on:touchstart={() => switchLang(code)}
						class="flex items-center gap-2 w-full p-2 hover:bg-base-200 rounded transition-colors"
						class:bg-base-200={code === $currentLang}
					>
						<span class="text-lg">{flag(code)}</span>
						<span class="text-sm uppercase">{code}</span>
						{#if code === $currentLang}
							<span class="ml-auto text-primary">✓</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	/* Amélioration pour mobile */
	@media (max-width: 768px) {
		.dropdown-content {
			position: fixed !important;
			top: auto !important;
			left: auto !important;
			right: 1rem !important;
			transform: none !important;
			margin-top: 0.5rem;
		}
	}
</style>