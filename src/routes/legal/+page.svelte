<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';

	onMount(() => onDestroy(tabTitle('landing.legal_mentions')));

	const legal_mentions_title = t('landing.legal_mentions.title');
	const legal_mentions_intro = t('landing.legal_mentions.intro');
	const legal_notice_title = t('landing.legal_mentions.legal_notice.title');
	const legal_notice_content = t('landing.legal_mentions.legal_notice.content');
	const privacy_policy_title = t('landing.legal_mentions.privacy_policy.title');
	const privacy_policy_content = t('landing.legal_mentions.privacy_policy.content');
	const terms_of_use_title = t('landing.legal_mentions.terms_of_use.title');
	const terms_of_use_content = t('landing.legal_mentions.terms_of_use.content');
	const terms_of_sale_title = t('landing.legal_mentions.terms_of_sale.title');
	const terms_of_sale_content = t('landing.legal_mentions.terms_of_sale.content');
	const disclaimer_title = t('landing.legal_mentions.disclaimer.title');
	const disclaimer_content = t('landing.legal_mentions.disclaimer.content');
</script>

<div class="container mx-auto">
	<h1 class="m-auto text-center text-2xl font-semibold md:w-2/3 md:text-4xl">
		{$legal_mentions_title}
	</h1>
	<p class="mt-5">{$legal_mentions_intro}</p>

	<h2 class="m-auto mt-10 mb-5 text-center text-xl font-semibold md:w-2/3 md:text-2xl">
		{$legal_notice_title}
	</h2>
	<p>{@html $legal_notice_content}</p>

	<h2 class="m-auto mt-10 mb-5 text-center text-xl font-semibold md:w-2/3 md:text-2xl">
		{$privacy_policy_title}
	</h2>
	<p>{@html $privacy_policy_content}</p>

	<h2 class="m-auto mt-10 mb-5 text-center text-xl font-semibold md:w-2/3 md:text-2xl">
		{$terms_of_use_title}
	</h2>
	<p>{@html $terms_of_use_content}</p>

	<h2 class="m-auto mt-10 mb-5 text-center text-xl font-semibold md:w-2/3 md:text-2xl">
		{$terms_of_sale_title}
	</h2>
	<p>{@html $terms_of_sale_content}</p>

	<h2 class="m-auto mt-10 mb-5 text-center text-xl font-semibold md:w-2/3 md:text-2xl">
		{$disclaimer_title}
	</h2>
	<p class="mb-10">{@html $disclaimer_content}</p>
</div>
