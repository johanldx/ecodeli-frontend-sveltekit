<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte';
	import AdminGuardWrapper from '$lib/components/AdminGuardWrapper.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
	import '../../app.css';
	import { t, tStatic } from '$lib/utils/t';

	const users_title = tStatic('admin.global.users_title');
	const addresses_title = tStatic('admin.global.addresses_title');
	const langs_title = tStatic('admin.global.langs_title');
	const ads_title = tStatic('admin.global.ads_title');
	const wallets_title = tStatic('admin.global.wallets_title');
	const invoices_title = 'Factures';

	let { children } = $props();

	const pages = [
		{ name: users_title, url: '/admin/users' },
		{ name: 'Professionels', url: '/admin/pro' },
		{ name: addresses_title, url: '/admin/addresses' },
		{ name: langs_title, url: '/admin/langs' },
		{ name: ads_title, url: '/admin/ads' },
		{ name: wallets_title, url: '/admin/wallets' },
		{ name: invoices_title, url: '/admin/invoices' }
	];
</script>

<AdminGuardWrapper>
	<Notifications />
	<AppMenu {pages} />
	<div class="w-full">
		{@render children()}
	</div>
</AdminGuardWrapper>
