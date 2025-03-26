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

	const footer_title = t('landing.global.footer.title');
	const footer_cta_button = t('landing.global.footer.cta_button');
	const footer_company_info_address = t('landing.global.footer.company_info.address');
	const footer_company_info_postal_code = t('landing.global.footer.company_info.postal_code');
	const footer_menu_private_space = t('landing.global.footer.menu.private_space');
	const footer_menu_business_space = t('landing.global.footer.menu.business_space');
	const footer_menu_legal_mentions = t('landing.global.footer.menu.legal_mentions');
	const footer_menu_admin = t('landing.global.footer.menu.admin');
	
	const hideLayout = derived(page, ($page) => {
		if ($page.status && $page.status >= 400) return false;
		
		return isExcludedLayoutRoute($page.url.pathname)
	});

</script>

<TranslationProvider lang="fr">
	{#if !$hideLayout}
		<nav class="top-0 left-0 w-full z-50 px-6 pt-4">
			<div class="container mx-auto flex justify-between items-center w-full py-3">
				
				<a href="/"><img src="/images/logo/ecodeli-light.png" alt="Logo" class="h-8 w-auto"></a>
		
				<div class="md:hidden flex items-center ">
				<button class="btn btn-ghost" onclick={() => isOpen.update(value => !value)} aria-label="Toggle menu">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7"/>
					</svg>
				</button>
				</div>
		
				<div class="hidden md:flex items-center space-x-6 ml-auto">
					<a href="/auth/register" class="relative transition duration-200 ease-in-out after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full">
						{$header_register_btn}
					</a>
					<a href="/auth/login" class="relative transition duration-200 ease-in-out after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full">
						{$header_login_btn}
					</a>
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
				<a href="/register" class="relative transition duration-200 ease-in-out after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full">
					S’inscrire
				</a>
				<a href="/login" class="relative transition duration-200 ease-in-out after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-200 after:ease-in-out hover:after:w-full">
					Se connecter
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
					<div class="flex flex-col md:flex-row justify-between items-start md:items-end py-6 gap-6">
						<p class="text-3xl md:text-6xl text-neutral-100 md:w-2/3 font-medium">{$footer_title}</p>
						<a href="login" class="btn btn-primary font-normal mt-10">{$footer_cta_button}</a>
					</div>
			
					<hr class="border-base-200 my-6">
			
					<div class="flex flex-col md:flex-row justify-between items-start md:items-end p-6 gap-6">
						<div>
							<img class="w-40" src="/images/logo/ecodeli-white.png" alt="Nexus ESGI">
							<p class="text-neutral-100 mt-2">
								{$footer_company_info_address} <br>
								{$footer_company_info_postal_code}
							</p>
						</div>
						<div class="flex flex-col md:flex-row md:gap-5 text-neutral-100">
							<a href="/login">{$footer_menu_private_space}</a>
							<a href="/login">{$footer_menu_business_space}</a>
							<a href="/legal">{$footer_menu_legal_mentions}</a>
							<a href="/admin">{$footer_menu_admin}</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</TranslationProvider>
