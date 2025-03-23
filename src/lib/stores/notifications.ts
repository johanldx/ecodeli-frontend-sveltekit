import { writable } from 'svelte/store';

let idCounter = 0;

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
	id: number;
	message: string;
	type: NotificationType;
	timeout?: number;
}

function createNotificationStore() {
	const { subscribe, update } = writable<Notification[]>([]);

	function send(message: string, type: NotificationType = 'info', timeout = 5000) {
		const id = ++idCounter;

		const newNotif: Notification = { id, message, type, timeout };
		update((n) => [...n, newNotif]);

		if (timeout) {
			setTimeout(() => dismiss(id), timeout);
		}
	}

	function dismiss(id: number) {
		update((n) => n.filter((notif) => notif.id !== id));
	}

	return {
		subscribe,
		send,
		dismiss,
		success: (msg: string) => send(msg, 'success'),
		error: (msg: string) => send(msg, 'error'),
		info: (msg: string) => send(msg, 'info'),
		warning: (msg: string) => send(msg, 'warning')
	};
}

export const notifications = createNotificationStore();
