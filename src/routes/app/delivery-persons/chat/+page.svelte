<script lang="ts">
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onMount, onDestroy } from 'svelte';
	import Chat from '$lib/components/Chat.svelte';

	onMount(() => {
		onDestroy(tabTitle('app.delivery-persons.chat.tab_title'));
	});
</script>

<Chat></Chat>
