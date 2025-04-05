<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
  import '../../../app.css';
  let { children } = $props();

  const pages = [
    { name: "Découvir", url: "/app/clients/discover" },
    { name: "Mes livraisons", url: "/app/clients/deliveries" },
    { name: "Mon planning", url: "/app/clients/planning" },
  ];
</script>

<GuardWrapper>
  <Notifications />
  <AppMenu pages={pages} />
  <div class="container mx-auto">
    {@render children()}
  </div>
</GuardWrapper>


