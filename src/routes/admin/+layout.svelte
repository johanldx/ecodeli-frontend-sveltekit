<script lang="ts">
	import AppMenu from '$lib/components/AppMenu.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
  import '../../app.css';
  let { children } = $props();

  const pages = [
    { name: "Utilisateurs", url: "/admin/users" },
  ];
</script>

<GuardWrapper>
  <AppMenu pages={pages} />
  <div class="container mx-auto">
    {@render children()}
  </div>
</GuardWrapper>