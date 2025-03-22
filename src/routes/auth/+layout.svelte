<script lang="ts">
	import '../../app.css';
	import { t } from '$lib/utils/t';
	import TranslationProvider from '$lib/components/TranslationProvider.svelte';

	let { children } = $props();
</script>

<TranslationProvider lang="fr">
	<div class="min-h-screen w-full flex items-center justify-center bg-base-content px-4">
		<div class="card w-full max-w-md bg-base-200 shadow-xl p-10">
			{@render children()}
		</div>
	</div>
</TranslationProvider>
