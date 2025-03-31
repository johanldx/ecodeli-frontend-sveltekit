<script lang="ts">
	import '../../app.css';
	import TranslationProvider from '$lib/components/TranslationProvider.svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import Notifications from '$lib/components/Notifications.svelte';

	let { children } = $props();
</script>

<TranslationProvider lang="fr">
	<Notifications/>
	<div class="fixed top-4 right-4 z-50">
		<LanguageSwitcher />
	</div>
	<div class="min-h-screen w-full flex items-center justify-center bg-base-content px-4">
		<div class="card min-w-md bg-base-200 shadow-xl p-10">
			{@render children()}
		</div>
	</div>
</TranslationProvider>