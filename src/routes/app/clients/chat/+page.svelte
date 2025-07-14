<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onMount, onDestroy } from 'svelte';

	onMount(() => onDestroy(tabTitle('app.clients.chat.tab_title')));
</script>

<Chat></Chat>
