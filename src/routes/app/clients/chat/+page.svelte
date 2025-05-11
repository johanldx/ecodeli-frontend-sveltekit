<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import { fetchFromAPI } from '$lib/utils/api';
	import { accessToken } from '$lib/stores/token';
	import { user } from '$lib/stores/user';
	import { get } from 'svelte/store';

	interface Conversation {
		id: number;
		adType: 'ShoppingAds' | 'DeliverySteps' | 'ServiceProvisions';
		adId: number;
	}

	interface Ad {
		title: string;
		description: string;
		price: number;
		type: 'delivery' | 'shopping' | 'service';
		offerPrice?: number;
	}

	interface Message {
		id: number;
		content: string;
		sender: { id?: number; name: string };
		conversation: { id: number };
	}

	let convList: Conversation[] = [];
	let selectedConv!: Conversation;
	let selectedConvId: number;
	let ad: Ad | null = null;
	let messages: Message[] = [];
	let newMessage = '';
	let showSlotModal = false;
	let socket: Socket;
	const currentUserId = get(user)?.id;

	function openSlotModal() {
		showSlotModal = true;
	}
	function closeSlotModal() {
		showSlotModal = false;
	}

	function updateUrl(id: number) {
		const params = new URLSearchParams(window.location.search);
		params.set('id', id.toString());
		history.replaceState(null, '', `chat?${params.toString()}`);
	}

	async function loadConversations() {
		const token = get(accessToken);
		convList = await fetchFromAPI<Conversation[]>('/conversations', {
			headers: { Authorization: `Bearer ${token}` }
		});
	}

	async function fetchAd(conv: Conversation): Promise<Ad> {
		const token = get(accessToken);
		if (conv.adType === 'ShoppingAds') {
			const raw = await fetchFromAPI<any>(`/shopping-ads/${conv.adId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			return {
				title: raw.title,
				description: raw.description,
				price: raw.price,
				type: 'shopping',
				offerPrice: raw.price
			};
		} else if (conv.adType === 'DeliverySteps') {
			const raw = await fetchFromAPI<any>(`/delivery-ads/${conv.adId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			return {
				title: raw.title,
				description: raw.description,
				price: raw.price,
				type: 'delivery',
				offerPrice: raw.price
			};
		} else {
			const raw = await fetchFromAPI<any>(`/service-ads/${conv.adId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			return {
				title: raw.title,
				description: raw.description,
				price: 0,
				type: 'service'
			};
		}
	}

	async function loadMessages(convId: number) {
		const token = get(accessToken);
		messages = await fetchFromAPI<Message[]>(`/messages?conversationId=${convId}`, {
			headers: { Authorization: `Bearer ${token}` }
		});
	}

	function connectWS(convId: number) {
		const token = get(accessToken);
		const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
		socket = io(`${BACKEND}/ws`, { auth: { token } });
		socket.emit('joinConversation', { conversationId: convId });
		socket.on('newMessage', (msg: Message) => {
			if (msg.conversation.id === convId) {
				messages = [...messages, msg];
			}
		});
	}

	async function selectConv(conv: Conversation) {
		selectedConv = conv;
		selectedConvId = conv.id;
		updateUrl(conv.id);
		if (socket) socket.disconnect();

		ad = null;
		await Promise.all([
			(async () => {
				ad = await fetchAd(conv);
			})(),
			loadMessages(conv.id)
		]);
		connectWS(conv.id);
	}

	function send() {
		if (!newMessage.trim()) return;
		socket.emit('sendMessage', {
			conversationId: selectedConv.id,
			content: newMessage
		});
		newMessage = '';
	}

	$: if (convList.length && selectedConvId !== selectedConv?.id) {
		const c = convList.find((c) => c.id === selectedConvId);
		if (c) selectConv(c);
	}

	onMount(async () => {
		await loadConversations();

		const params = new URLSearchParams(window.location.search);
		const raw = params.get('id');
		const id = raw ? Number(raw) : NaN;
		const first = convList.find((c) => c.id === id) ?? convList[0];

		await selectConv(first);
	});

	onDestroy(() => {
		if (socket) socket.disconnect();
	});
</script>

<div class="h-screen">
	<div class="mt-20 flex h-[70vh] overflow-hidden rounded-2xl border-2 border-gray-300">
		{#if selectedConv}
			<aside
				class="hidden w-64 flex-col overflow-hidden rounded-l-lg border-r border-gray-300 bg-white md:flex"
			>
				<ul class="flex-1 overflow-y-auto">
					{#each convList as conv}
						<button
							class="flex w-full items-center border-b border-gray-200 p-3 hover:bg-gray-200 {selectedConv.id ===
							conv.id
								? 'bg-base-100'
								: ''}"
							on:click={() => selectConv(conv)}
						>
							<div class="mr-3 h-8 w-1 rounded bg-green-500"></div>
							<div class="flex flex-col">
								<span class="font-semibold">Conversation #{conv.id}</span>
							</div>
						</button>
					{/each}
				</ul>
			</aside>

			<div class="border-b border-gray-300 bg-white p-2 md:hidden">
				<select bind:value={selectedConvId} class="select select-bordered w-full">
					{#each convList as conv}
						<option value={conv.id}>Conversation #{conv.id}</option>
					{/each}
				</select>
			</div>
		{:else}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
				<span class="loading loading-spinner loading-lg text-primary"></span>
			</div>
		{/if}

		<div class="flex flex-1 flex-col rounded-r-lg border-gray-300">
			{#if ad}
				<header class="flex items-start justify-between border-b border-gray-300 bg-white p-4">
					<div>
						<div class="mb-2 flex items-center space-x-2">
							<button class="badge badge-neutral">Mon annonce</button>
							<span class="badge badge-secondary">{ad.price} €</span>
						</div>
						<h2 class="text-lg font-bold">{ad.title}</h2>
						<p class="text-sm text-gray-600">{ad.description}</p>
					</div>
					{#if ad.type === 'delivery' || ad.type === 'shopping'}
						<button class="btn btn-primary">Accepter {ad.offerPrice} €</button>
					{:else}
						<button class="btn btn-primary" on:click={openSlotModal}>Choisir un créneau</button>
					{/if}
				</header>
			{:else}
				<div class="p-4">Chargement de l’annonce…</div>
			{/if}

			<main class="flex-1 space-y-4 overflow-y-auto bg-white p-4">
				{#each messages as m}
					{#if !m.sender.id}
						<div class="chat chat-center">
							<div class="chat-header text-xs text-gray-500">{m.sender.name}</div>
							<div class="chat-bubble bg-base-content text-white">{m.content}</div>
						</div>
					{:else if m.sender.id === currentUserId}
						<div class="chat chat-end">
							<div class="chat-header text-xs text-gray-500">{m.sender.name}</div>
							<div class="chat-bubble bg-primary">{m.content}</div>
						</div>
					{:else}
						<div class="chat chat-start">
							<div class="chat-header text-xs text-gray-500">{m.sender.name}</div>
							<div class="chat-bubble bg-gray-300">{m.content}</div>
						</div>
					{/if}
				{/each}
			</main>

			<footer class="border-t border-gray-300 bg-white p-4">
				<div class="flex">
					<input
						type="text"
						bind:value={newMessage}
						placeholder="Tapez un message…"
						class="input input-bordered flex-1"
						on:keydown={(e) => e.key === 'Enter' && send()}
					/>
					<button class="btn btn-primary ml-2" on:click={send}>→</button>
				</div>
			</footer>
		</div>
	</div>

	{#if showSlotModal}
		<div class="modal modal-open">
			<div class="modal-box">
				<h3 class="text-lg font-bold">Choisir un créneau</h3>
				<div class="modal-action">
					<button class="btn" on:click={closeSlotModal}>Annuler</button>
					<button class="btn btn-primary" on:click={closeSlotModal}>Confirmer</button>
				</div>
			</div>
		</div>
	{/if}
</div>
