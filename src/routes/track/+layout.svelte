<script lang="ts">
	import '../../app.css';
	import TranslationProvider from '$lib/components/TranslationProvider.svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import Notifications from '$lib/components/Notifications.svelte';

	let { children } = $props();
</script>

<TranslationProvider lang="fr">
	<Notifications />
	<div class="fixed top-4 right-4 z-50">
		<LanguageSwitcher />
	</div>
	<div class="bg-base-content flex min-h-screen w-full items-center justify-center px-4">
		<div class="card bg-base-200 min-w-md p-10 shadow-xl">
			{@render children()}
		</div>
	</div>
</TranslationProvider>
