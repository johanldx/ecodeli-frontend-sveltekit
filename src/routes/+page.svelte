<script>
    import LandingHeader from "$lib/components/LandingHeader.svelte";
    import { lang, loadLang } from "$lib/stores/lang";
    import { onMount } from "svelte";

    onMount(() => {
        loadLang("en"); // Charger la langue au démarrage
    });
</script>

<LandingHeader/>

{#if $lang}
<div class="mt-10 color-dark-green text-center">
    <h1 class="text-center m-auto font-semibold text-3xl md:text-7xl md:w-2/3 color-dark-green">{$lang.landing.index_page.main_title}</h1>
    <p class="text-center m-auto mt-10 text-md md:w-3/4 text-nexus-blue">
        {$lang.landing.index_page.main_description}
    </p>

    <a href="login" class="btn btn-primary font-normal mt-10">Voir les annonces</a>
</div>
{:else}
<p>Chargement des traductions...</p>
{/if}