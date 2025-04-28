<script lang="ts">
	import { writable } from 'svelte/store';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import AccountMenu from './AccountMenu.svelte';

	export let pages: { name: string; url: string }[] = [];
	export let isOpen = writable(false);
	export const dropdownOpen = writable(false);
</script>

<nav class="top-0 left-0 z-50 w-full px-6 pt-4">
	<div class="container mx-auto flex w-full items-center justify-between py-3">
		<a href="/app"><img src="/images/logo/ecodeli-light.png" alt="Logo" class="h-8 w-auto" /></a>

		<div class="flex items-center lg:hidden">
			<button
				class="btn btn-ghost"
				onclick={() => isOpen.update((value) => !value)}
				aria-label="Toggle menu"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
				</svg>
			</button>
		</div>

		<div class="ml-auto hidden items-center space-x-6 lg:flex">
			{#each pages as page}
				<a
					href={page.url}
					class="relative transition duration-200 ease-in-out after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full"
				>
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
		class="bg-opacity-50 fixed inset-0 transition-opacity duration-300"
		aria-label="Close menu"
		onclick={() => isOpen.set(false)}
		onkeydown={(e) => e.key === 'Enter' && isOpen.set(false)}
	>
	</button>
{/if}

<div
	class="bg-base-100 fixed top-0 right-0 z-50 h-full w-64 transform shadow-lg transition-transform duration-300 ease-in-out {$isOpen
		? 'translate-x-0'
		: 'translate-x-full'}"
>
	<div class="flex flex-col space-y-4 p-6">
		<button class="btn btn-ghost self-end" onclick={() => isOpen.set(false)}> ✕ </button>

		{#each pages as page}
			<a
				href={page.url}
				class="relative transition duration-200 ease-in-out after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full"
			>
				{page.name}
			</a>
		{/each}

		<hr class="border-gray-100" />

		<AccountMenu />
		<LanguageSwitcher />
	</div>
</div>
