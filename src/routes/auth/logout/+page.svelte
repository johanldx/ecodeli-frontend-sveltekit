<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { clearTokens } from '$lib/utils/auth';
	import { user } from '$lib/stores/user';

	onMount(() => {
		localStorage.clear();
		clearTokens();
		user.set(null);
		goto('/auth/login');
	});
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center">
	<span class="loading loading-spinner loading-lg text-white"></span>
</div>
