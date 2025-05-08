<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
	import { t } from '$lib/utils/t';
	import { derived, type Readable } from 'svelte/store';

	let { children } = $props();

	type Page = { name: string; url: string };

	const links: { key: string; url: string }[] = [
		{ key: 'discover_link', url: '/app/delivery-persons/discover' },
		{ key: 'discussion_link', url: '/app/delivery-persons/chat' },
		{ key: 'delivery_link', url: '/app/delivery-persons/deliveries' },
		{ key: 'schedule_link', url: '/app/delivery-persons/planning' },
		{ key: 'addresses_link', url: '/app/delivery-persons/addresses' }
	];

	const translationStores = links.map((link) => t(`app.global.menu.${link.key}`));

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
