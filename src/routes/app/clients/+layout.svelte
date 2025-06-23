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
				title: 'Bienvenue sur votre espace EcoDeli !',
				content: "Suivez ce guide rapide pour découvrir les fonctionnalités principales."
			},
			{
				title: 'Menu de Navigation',
				content: "Utilisez ce menu pour naviguer entre les différentes sections de votre espace.",
				targetSelector: '#main-nav'
			},
			{
				title: 'Découvrir des annonces',
				content: 'La section <b>Découvrir</b> vous permet de trouver toutes les annonces disponibles.',
				targetSelector: '#nav-discover'
			},
			{
				title: 'Gérer vos annonces',
				content: 'Dans <b>Mes annonces</b>, vous pouvez créer et gérer toutes les annonces que vous publiez.',
				targetSelector: '#nav-ads'
			},
			{
				title: 'Messagerie instantanée',
				content: 'La section <b>Messages</b> contient toutes vos conversations avec les autres utilisateurs.',
				targetSelector: '#nav-chat'
			},
			{
				title: 'Gestion du compte',
				content: 'Dans <b>Mon compte</b>, vous pouvez gérer vos informations, votre portefeuille et vos abonnements.',
				targetSelector: '#nav-account'
			},
			{
				title: 'Vous êtes prêt !',
				content: 'Vous pouvez maintenant explorer la plateforme. Vous pouvez revoir ce tutoriel à tout moment depuis la page "Mon compte".'
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
