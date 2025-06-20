<script lang="ts">
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';

	onMount(() => {
		onDestroy(tabTitle('admin.ads.tab_title'));
	});
</script>

Gestion des annonces
