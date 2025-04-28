<script lang="ts">
	import { translations, translationsReady, currentLang } from '$lib/stores/i18n';
	import { fetchFromAPI } from '$lib/utils/api';
	import { flattenObject } from '$lib/utils/flatten';

	$: if ($currentLang) {
		fetchFromAPI(`/langs/${$currentLang}`)
			.then((data) => flattenObject(data as Record<string, any>))
			.then(translations.set)
			.catch((err) => {
				console.error('[TranslationProvider] Erreur chargement', err);
				fetchFromAPI('/langs/fr')
					.then((data) => flattenObject(data as Record<string, any>))
					.then(translations.set)
					.catch((err) => console.error('[TranslationProvider] Erreur chargement langue FR', err));
			});
	}
</script>

{#if $translationsReady}
	<slot />
{:else}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{/if}
