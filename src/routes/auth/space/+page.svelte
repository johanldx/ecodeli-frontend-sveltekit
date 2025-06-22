<script lang="ts">
	import { t } from '$lib/utils/t';
	import { user } from '$lib/stores/user';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import { profileIds } from '$lib/stores/profiles';
	import { get } from 'svelte/store';
	import { onMount, onDestroy } from 'svelte';
	import { tabTitle } from '$lib/utils/tabTitle';

	function waitUntil(conditionFn: () => boolean, interval = 50): Promise<void> {
		return new Promise((resolve) => {
			const check = () => {
				if (conditionFn()) resolve();
				else setTimeout(check, interval);
			};
			check();
		});
	}

	$: title = t('auth.space.title', { name: $user?.first_name || 'utilisateur' });

	const client_label = t('auth.space.options.client_link');
	const delivery_label = t('auth.space.options.delivery_link');
	const merchant_label = t('auth.space.options.merchant_link');
	const service_provider_label = t('auth.space.options.service_provider_link');
	const account_label = t('auth.space.options.account_link');
	const logout_label = t('auth.space.logout');
	const admin_label = t('auth.space.options.admin_link') || 'Administration';

	onMount(async () => {
		await waitUntil(() => !!get(profileIds));
		console.log(get(profileIds));
		onDestroy(tabTitle('auth.space.tab_title'));
	});

	$: hasClientProfile = get(profileIds).clientId;
	$: hasDeliveryProfile = get(profileIds).deliveryPersonId;
	$: hasMerchantProfile = get(profileIds).traderId;
	$: hasServiceProviderProfile = get(profileIds).providerId;
</script>

<GuardWrapper>
	<div class="text-center">
		<a href="/"
			><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt="" /></a
		>
		<h1 class="mt-10 text-xl font-semibold">{$title}</h1>

		<div class="my-5 space-y-5">
			<a
				href="/auth/space/clients"
				class="btn {hasClientProfile ? 'btn-primary' : 'border-primary'} w-full">{$client_label}</a
			>
			<a
				href="/auth/space/delivery-persons"
				class="btn {hasDeliveryProfile ? 'btn-primary' : 'border-primary'} w-full"
				>{$delivery_label}</a
			>
			<a
				href="/auth/space/traders"
				class="btn {hasMerchantProfile ? 'btn-primary' : 'border-primary'} w-full"
				>{$merchant_label}</a
			>

			{#if $user?.administrator}
			<a href="/admin" class="btn btn-error w-full">{$admin_label}</a>
			{/if}

			<a
				href="/auth/space/providers"
				class="btn {hasServiceProviderProfile ? 'btn-primary' : 'border-primary'} w-full"
				>{$service_provider_label}</a
			>
			<a href="/auth/account" class="btn btn-secondary w-full">{$account_label}</a>
		</div>

		<div class="mt-6">
			<a href="/auth/logout">{$logout_label}</a>
		</div>
	</div>
</GuardWrapper>
