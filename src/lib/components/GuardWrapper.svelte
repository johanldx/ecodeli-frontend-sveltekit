<script lang="ts">
	import { onMount } from 'svelte';
	import { guardRoute } from '$lib/utils/guards';

	let loading = true;

	onMount(async () => {
		const isValid = await guardRoute();
		loading = false;
	});
</script>

{#if loading}
	<div class="fixed inset-0 flex items-center justify-center bg-white z-50">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else}
	<slot />
{/if}
