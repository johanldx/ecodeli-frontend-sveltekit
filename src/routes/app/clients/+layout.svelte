<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
	import { t } from '$lib/utils/t';
	import { derived, type Readable } from 'svelte/store';
	import { onDestroy, onMount } from 'svelte';
	import { tabTitle } from '$lib/utils/tabTitle';

	onMount(() => onDestroy(tabTitle('app.clients.new-ads')));

	let { children } = $props();

	type Page = { name: string; url: string };

	const links: { key: string; url: string }[] = [
		{ key: 'discover_link', url: '/app/clients/discover' },
		{ key: 'discussion_link', url: '/app/clients/conversations' },
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

<GuardWrapper>
	<Notifications />
	<AppMenu pages={$pages} />
	<div class="container mx-auto">
		{@render children()}
	</div>
</GuardWrapper>
