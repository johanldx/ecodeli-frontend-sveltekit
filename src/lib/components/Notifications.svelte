<script lang="ts">
	import { notifications, type Notification } from '$lib/stores/notifications';
	import { fly } from 'svelte/transition';

	let notifs: Notification[] = [];
	notifications.subscribe((value) => (notifs = value));
</script>

<div class="fixed bottom-4 left-4 z-50 flex w-[22rem] flex-col gap-4">
	{#each notifs as notif (notif.id)}
		<div
			in:fly={{ y: 10, duration: 200 }}
			out:fly={{ y: -10, duration: 200 }}
			class={`relative flex items-center justify-between gap-4 rounded-lg p-4 shadow-md 
		  ${
				notif.type === 'success'
					? 'bg-primary text-primary-content'
					: notif.type === 'error'
						? 'text-base-200 bg-red-600'
						: notif.type === 'warning'
							? 'text-primary-content bg-orange-400'
							: 'bg-blue-600'
			}
		`}
		>
			<span class="flex-1">{notif.message}</span>
			<button
				on:click={() => notifications.dismiss(notif.id)}
				class="absolute top-1/2 right-2 -translate-y-1/2 text-xl leading-none hover:opacity-80"
				aria-label="Fermer"
			>
				×
			</button>
		</div>
	{/each}
</div>
