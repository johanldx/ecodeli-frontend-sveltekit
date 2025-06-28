<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import ProfileGuard from '$lib/components/ProfileGuard.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
	import { t } from '$lib/utils/t';
	import { derived, type Readable } from 'svelte/store';
	import { onDestroy, onMount } from 'svelte';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { page } from '$app/stores';
	import { tStatic } from '$lib/utils/t';
	import OnboardingModal from '$lib/components/OnboardingModal.svelte';
	import { isTourActive, tourSteps, startTour } from '$lib/stores/tour';
	import type { TourStep } from '$lib/types/tour';

	onMount(() => {
		onDestroy(tabTitle('app.clients.new-ads.tab_title'));

		// Définit les étapes du tutoriel
		tourSteps.set([
			{
				title: tStatic('app.tutorial.welcome'),
				content: tStatic('app.tutorial.welcome_content')
			},
			{
				title: tStatic('app.tutorial.navigation_menu'),
				content: tStatic('app.tutorial.navigation_content'),
				targetSelector: '#main-nav'
			},
			{
				title: tStatic('app.tutorial.discover_announcements'),
				content: tStatic('app.tutorial.discover_content'),
				targetSelector: '#nav-discover'
			},
			{
				title: tStatic('app.tutorial.manage_announcements'),
				content: tStatic('app.tutorial.manage_content'),
				targetSelector: '#nav-ads'
			},
			{
				title: tStatic('app.tutorial.instant_messaging'),
				content: tStatic('app.tutorial.messaging_content'),
				targetSelector: '#nav-chat'
			},
			{
				title: tStatic('app.tutorial.account_management'),
				content: tStatic('app.tutorial.account_content'),
				targetSelector: '#nav-account'
			},
			{
				title: tStatic('app.tutorial.ready'),
				content: tStatic('app.tutorial.ready_content')
			}
		]);

		const hasSeenTour = localStorage.getItem('tutorialSeen');
		if (!hasSeenTour) {
			// Attend un court instant pour que l'UI se charge
			setTimeout(startTour, 500);
		}
	});

	let { children } = $props();

	type Page = { name: string; url: string };

	const links: { key: string; url: string }[] = [
		{ key: 'discover_link', url: '/app/clients/discover' },
		{ key: 'discussion_link', url: '/app/clients/chat' },
		{ key: 'announces_link', url: '/app/clients/ads' },
		{ key: 'addresses_link', url: '/app/clients/addresses' }
	];

	// Création d'un tableau de stores de traduction
	const translationStores = links.map((link) => t(`app.global.menu.${link.key}`));

	// Création d'une store dérivée de toutes les stores de traduction
	const pages: Readable<Page[]> = derived(translationStores, (translations) =>
		translations.map((name, i) => ({
			name,
			url: links[i].url
		}))
	);
</script>

<OnboardingModal />

<GuardWrapper>
	<ProfileGuard profileType="clients">
		<Notifications />
		<AppMenu pages={$pages} />
		<div class="container mx-auto">
			{@render children()}
		</div>
	</ProfileGuard>
</GuardWrapper>
