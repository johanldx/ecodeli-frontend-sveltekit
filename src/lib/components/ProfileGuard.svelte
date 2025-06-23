<script lang="ts">
	import { onMount } from 'svelte';
	import { guardProfileAccess } from '$lib/utils/guards';

	export let profileType: 'clients' | 'delivery-persons' | 'providers' | 'traders';

	let loading = true;
	let hasAccess = false;

	onMount(async () => {
		hasAccess = await guardProfileAccess(profileType);
		loading = false;
	});
</script>

{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else if hasAccess}
	<slot />
{/if} 