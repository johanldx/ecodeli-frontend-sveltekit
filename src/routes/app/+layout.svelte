<script lang="ts">
	import GuardWrapper from "$lib/components/GuardWrapper.svelte";
    let { children } = $props();
</script>

<GuardWrapper>
    {@render children()}
</GuardWrapper>