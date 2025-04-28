<script lang="ts">
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';

	onMount(() => {
		onDestroy(tabTitle('admin.ads'));
	});
</script>

Gestion des annonces
