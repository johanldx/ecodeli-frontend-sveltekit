<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
	import '../../app.css';
	import { t, tStatic } from '$lib/utils/t';

	const users_title = tStatic('admin.global.users_title');
	const addresses_title = tStatic('admin.global.addresses_title');
	const langs_title = tStatic('admin.global.langs_title');
	const ads_title = tStatic('admin.global.ads_title');

	let { children } = $props();

	const pages = [
		{ name: users_title, url: '/admin/users' },
		{ name: 'Prestataire', url: '/admin/providers' },
		{ name: addresses_title, url: '/admin/addresses' },
		{ name: langs_title, url: '/admin/langs' },
		{ name: ads_title, url: '/admin/ads' }
	];
</script>

<GuardWrapper>
	<Notifications />
	<AppMenu {pages} />
	<div class="container mx-auto">
		{@render children()}
	</div>
</GuardWrapper>
