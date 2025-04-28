<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/utils/t';

	const status = $page.status || 500;

	const errorMessage = t(`landing.global.errors.${status}.message`);
	const errorActionLabel = t(`landing.global.errors.${status}.action_label`);
	const errorActionHref = t(`landing.global.errors.${status}.action_href`);

	const reload = () => location.reload();
</script>

<div class="container mx-auto min-h-[50vh] py-20 text-center">
	<h1 class="m-auto text-3xl font-semibold md:w-2/3 md:text-6xl">{status}</h1>
	<h2 class="mt-5 text-sm md:text-xl">{$errorMessage}</h2>

	{#if $errorActionHref === 'reload'}
		<button on:click={reload} class="btn btn-primary mt-10 font-normal">
			{$errorActionLabel}
		</button>
	{:else}
		<a href={$errorActionHref} class="btn btn-primary mt-10 font-normal">
			{$errorActionLabel}
		</a>
	{/if}
</div>
