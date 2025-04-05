<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
  import '../../../app.css';
  let { children } = $props();

  const pages = [
    { name: "Mes conversations", url: "/app/providers/conversations" },
    { name: "Mes services", url: "/app/providers/services" },
    { name: "Mon planning", url: "/app/providers/calendar " },
  ];
</script>

<GuardWrapper>
  <Notifications />
  <AppMenu pages={pages} />
  <div class="container mx-auto">
    {@render children()}
  </div>
</GuardWrapper>
