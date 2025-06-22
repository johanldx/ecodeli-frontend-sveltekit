<script lang="ts">
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import Co2Calculator from '$lib/components/Co2Calculator.svelte';
	import { accessToken } from '$lib/stores/token';

	let { children } = $props();
</script>

<GuardWrapper>
	{@render children()}
</GuardWrapper>

{#if $accessToken}
	<Co2Calculator />
{/if}
