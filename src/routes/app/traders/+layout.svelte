<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
  import '../../../app.css';
  let { children } = $props();

  const pages = [
    { name: "Mes conversations", url: "/app/traders/conversations" },
    { name: "Mes demandes", url: "/app/traders/demandes" },
  ];
</script>

<GuardWrapper>
  <Notifications />
  <AppMenu pages={pages} />
  <div class="container mx-auto">
    {@render children()}
  </div>
</GuardWrapper>
