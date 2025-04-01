<script lang="ts">
	import { notifications, type Notification } from '$lib/stores/notifications';
	import { fly } from 'svelte/transition';
  
	let notifs: Notification[] = [];
	notifications.subscribe((value) => (notifs = value));
  </script>
  
  <div class="fixed bottom-4 left-4 z-50 flex flex-col gap-4 w-[22rem]">
	{#each notifs as notif (notif.id)}
	  <div
		in:fly={{ y: 10, duration: 200 }}
		out:fly={{ y: -10, duration: 200 }}
		class={`relative flex items-center justify-between gap-4 p-4 rounded-lg shadow-md 
		  ${notif.type === 'success' ? 'bg-primary text-primary-content' :
			notif.type === 'error'   ? 'bg-red-600 text-base-200'   :
			notif.type === 'warning' ? 'bg-orange-400 text-primary-content' :
			'bg-blue-600'}
		`}
	  >
		<span class="flex-1">{notif.message}</span>
		<button
		  on:click={() => notifications.dismiss(notif.id)}
		  class="absolute top-1/2 -translate-y-1/2 right-2 text-xl leading-none hover:opacity-80"
		  aria-label="Fermer"
		>
		  ×
		</button>
	  </div>
	{/each}
  </div>  
