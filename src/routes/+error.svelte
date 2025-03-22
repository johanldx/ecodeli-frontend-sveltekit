<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/utils/t';

	const status = $page.status || 500;

	const errorMessage = t(`landing.global.errors.${status}.message`);
	const errorActionLabel = t(`landing.global.errors.${status}.action_label`);
	const errorActionHref = t(`landing.global.errors.${status}.action_href`);

	const reload = () => location.reload();
</script>

<div class="container mx-auto py-20 text-center min-h-[50vh]">
    <h1 class="m-auto font-semibold text-3xl md:text-6xl md:w-2/3">{status}</h1>
    <h2 class="text-sm md:text-xl mt-5">{$errorMessage}</h2>

    {#if $errorActionHref === 'reload'}
        <button on:click={reload} class="btn btn-primary font-normal mt-10">
            {$errorActionLabel}
        </button>
    {:else}
        <a href={$errorActionHref} class="btn btn-primary font-normal mt-10">
            {$errorActionLabel}
        </a>
    {/if}
</div>
