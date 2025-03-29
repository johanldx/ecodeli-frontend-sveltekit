<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { clearTokens } from '$lib/utils/auth';
  import { user } from '$lib/stores/user';

  onMount(() => {
    clearTokens();
    user.set(null);
    goto('/auth/login');
  });
</script>

<div class="fixed inset-0 flex items-center justify-center z-50">
  <span class="loading loading-spinner loading-lg text-white"></span>
</div>
