<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import ProfileGuard from '$lib/components/ProfileGuard.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
	import { t } from '$lib/utils/t';
	import { derived, type Readable } from 'svelte/store';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onMount, onDestroy } from 'svelte';

	import '../../../app.css';

	let { children } = $props();

	type Page = { name: string; url: string };

	const links: { key: string; url: string }[] = [
		{ key: 'discussion_link', url: '/app/providers/chat' },
		{ key: 'service_link', url: '/app/providers/services' },
		{ key: 'schedule_link', url: '/app/providers/calendar' },
		{ key: 'addresses_link', url: '/app/providers/addresses' }
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
	<ProfileGuard profileType="providers">
		<Notifications />
		<AppMenu pages={$pages} />
		<div class="container mx-auto">
			{@render children()}
		</div>
	</ProfileGuard>
</GuardWrapper>
