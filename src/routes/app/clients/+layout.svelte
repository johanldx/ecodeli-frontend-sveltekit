<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
  import '../../../app.css';
  let { children } = $props();

  const pages = [
    { name: "Découvir", url: "/app/clients/discover" },
    { name: "Mes conversations", url: "/app/clients/conversations" },
    { name: "Mes annonces", url: "/app/clients/ads" },
    { name: "Mes adresses", url: "/app/clients/addresses" },
  ];
</script>

<GuardWrapper>
  <AppMenu pages={pages} />
  <div class="container mx-auto">
    {@render children()}
  </div>
</GuardWrapper>
