<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import { isExcludedLayoutRoute } from '$lib/utils/routes';
	import { t } from '$lib/utils/t';
	import { writable } from 'svelte/store';
	import TranslationProvider from '$lib/components/TranslationProvider.svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

	let { children } = $props();
	let isOpen = writable(false);

	const header_register_btn = t('landing.global.header.menu.register');
	const header_login_btn = t('landing.global.header.menu.login');
	const close_btn = t('landing.global.common.close');

	const footer_title = t('landing.global.footer.title');
	const footer_cta_button = t('landing.global.footer.cta_button');
	const footer_company_info_address = t('landing.global.footer.company_info.address');
	const footer_company_info_postal_code = t('landing.global.footer.company_info.postal_code');
	const footer_menu_private_space = t('landing.global.footer.menu.private_space');
	const footer_menu_business_space = t('landing.global.footer.menu.business_space');
	const footer_menu_legal_mentions = t('landing.global.footer.menu.legal_mentions');
	const footer_menu_admin = t('landing.global.footer.menu.admin');
	const footer_menu_track = t('landing.global.footer.menu.track');
	const hideLayout = derived(page, ($page) => {
		if ($page.status && $page.status >= 400) return false;

		return isExcludedLayoutRoute($page.url.pathname);
	});
</script>

<TranslationProvider lang="fr">
	{#if !$hideLayout}
		<nav class="top-0 left-0 z-50 w-full px-6 pt-4">
			<div class="container mx-auto flex w-full items-center justify-between py-3">
				<a href="/"><img src="/images/logo/ecodeli-light.png" alt="Logo" class="h-8 w-auto" /></a>

				<div class="flex items-center md:hidden">
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

				<div class="ml-auto hidden items-center space-x-6 md:flex">
					<a
						href="/auth/register"
						class="relative transition duration-200 ease-in-out after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full"
					>
						{$header_register_btn}
					</a>
					<a
						href="/auth/login"
						class="relative transition duration-200 ease-in-out after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full"
					>
						{$header_login_btn}
					</a>
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
				<button class="btn btn-ghost self-end" onclick={() => isOpen.set(false)}> {$close_btn} </button>
				<a
					href="/register"
					class="relative transition duration-200 ease-in-out after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full"
				>
					{$header_register_btn}
				</a>
				<a
					href="/login"
					class="relative transition duration-200 ease-in-out after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full"
				>
					{$header_login_btn}
				</a>
				<LanguageSwitcher />
			</div>
		</div>
	{/if}

	{@render children()}

	{#if !$hideLayout}
		<div class="bg-neutral text-base-200 w-full pt-20">
			<div class="container mx-auto">
				<div class="container mx-auto">
					<div
						class="flex flex-col items-start justify-between gap-6 py-6 md:flex-row md:items-end"
					>
						<p class="text-3xl font-medium text-neutral-100 md:w-2/3 md:text-6xl">
							{$footer_title}
						</p>
						<a href="auth/space" class="btn btn-primary mt-10 font-normal">{$footer_cta_button}</a>
					</div>

					<hr class="border-base-200 my-6" />

					<div class="flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-end">
						<div>
							<img class="w-40" src="/images/logo/ecodeli-white.png" alt="Nexus ESGI" />
							<p class="mt-2 text-neutral-100">
								{$footer_company_info_address} <br />
								{$footer_company_info_postal_code}
							</p>
						</div>
						<div class="flex flex-col text-neutral-100 md:flex-row md:gap-5">
							<a href="/clients">{$footer_menu_private_space}</a>
							<a href="/traders">{$footer_menu_business_space}</a>
							<a href="/legal">{$footer_menu_legal_mentions}</a>
							<a href="/admin">{$footer_menu_admin}</a>
							<a href="/track">{$footer_menu_track}</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</TranslationProvider>
