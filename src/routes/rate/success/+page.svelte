<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy } from 'svelte';

	// Traductions
	const rate_success_title = t('rate.success.title');
	const rate_success_message = t('rate.success.message');
	const rate_success_redirect = t('rate.success.redirect_message');
	const rate_success_back = t('rate.success.back_button');

	onMount(() => {
		onDestroy(tabTitle('rate'));
		
		// Redirection automatique vers l'accueil après 5 secondes
		const timer = setTimeout(() => {
			goto('/');
		}, 5000);

		return () => clearTimeout(timer);
	});
</script>

<div class="text-center">
	<a href="/"><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt="" /></a>

	<div class="mt-10">
		<h1 class="text-2xl font-semibold mb-4">{$rate_success_title}</h1>
		<p class="text-gray-600 mb-6">
			{$rate_success_message}
		</p>
		<p class="text-sm text-gray-500 mb-6">
			{$rate_success_redirect}
		</p>
		<a href="/" class="btn btn-primary">{$rate_success_back}</a>
	</div>
</div> 