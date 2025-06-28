<script lang="ts">
	import AdminDropdownMenu from '$lib/components/AdminDropdownMenu.svelte';
	import AdminGuardWrapper from '$lib/components/AdminGuardWrapper.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
	import '../../app.css';
	import { t, tStatic } from '$lib/utils/t';
	import { page } from '$app/stores';

	const users_title = tStatic('admin.global.users_title');
	const addresses_title = tStatic('admin.global.addresses_title');
	const langs_title = tStatic('admin.global.langs_title');
	const ads_title = tStatic('admin.global.ads_title');
	const wallets_title = tStatic('admin.global.wallets_title');
	const invoices_title = tStatic('admin.global.invoices_title');
	const payments_title = tStatic('admin.global.payments_title');
	const professionals_title = tStatic('admin.global.professionals_title');
	const ratings_title = tStatic('admin.global.ratings_title');
	const users_group = tStatic('admin.global.users_group');
	const accounting_group = tStatic('admin.global.accounting_group');
	const content_group = tStatic('admin.global.content_group');

	let { children } = $props();

	const groupedPages = [
		{
			group: users_group,
			items: [
				{ name: users_title, url: '/admin/users' },
				{ name: professionals_title, url: '/admin/pro' },
				{ name: ratings_title, url: '/admin/ratings' },
			]
		},
		{
			group: accounting_group,
			items: [
				{ name: wallets_title, url: '/admin/wallets' },
				{ name: invoices_title, url: '/admin/invoices' },
				{ name: payments_title, url: '/admin/ad-payments' }
			]
		},
		{
			group: content_group,
			items: [
				{ name: ads_title, url: '/admin/ads-management' },
				{ name: addresses_title, url: '/admin/addresses' },
				{ name: langs_title, url: '/admin/langs' },
			]
		}
	];
</script>

<AdminGuardWrapper>
	<Notifications />
	<AdminDropdownMenu groups={groupedPages} currentUrl={$page.url.pathname} />
	<div class="w-full">
		{@render children()}
	</div>
</AdminGuardWrapper>
