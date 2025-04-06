<script lang="ts">
  import AppMenu from '$lib/components/AppMenu.svelte';
  import GuardWrapper from '$lib/components/GuardWrapper.svelte';
  import Notifications from '$lib/components/Notifications.svelte';
  import { t } from '$lib/utils/t';
  import { derived, type Readable } from 'svelte/store';

  import '../../../app.css';

  let { children } = $props();

  type Page = { name: string; url: string };

  const links: { key: string; url: string }[] = [
    { key: 'discussion_link', url: '/app/providers/conversations' },
    { key: 'service_link', url: '/app/providers/services' },
    { key: 'schedule_link', url: '/app/providers/calendar' }
  ];

  const translationStores = links.map(link => t(`app.global.menu.${link.key}`));

  const pages: Readable<Page[]> = derived(translationStores, (translations) =>
    translations.map((name, i) => ({
      name,
      url: links[i].url
    }))
  );
</script>

<GuardWrapper>
  <Notifications />
  <AppMenu pages={$pages} />
  <div class="container mx-auto">
    {@render children()}
  </div>
</GuardWrapper>
