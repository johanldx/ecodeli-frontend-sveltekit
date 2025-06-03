<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import { fetchFromAPI } from '$lib/utils/api';
	import { accessToken } from '$lib/stores/token';
	import { user } from '$lib/stores/user';
	import { notifications } from '$lib/stores/notifications';
	import { get } from 'svelte/store';

	let isLoading = true;

	interface Conversation {
		id: number;
		adType: 'ShoppingAds' | 'DeliverySteps' | 'ServiceProvisions' | 'ReleaseCartAds';
		adId: number;
		userFrom: { id: number };
        price: number;
	}

	interface Message {
		id: number;
		content: string;
		sender: { id?: number; name: string };
		conversation: { id: number };
	}

	let convList: Conversation[] = [];
	let selectedConv: Conversation | null = null;
	let selectedConvId: number;
	let ad: any = null;
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

		console.log(convList);
	}

	async function fetchAd(conv: Conversation): Promise<any> {
		const token = get(accessToken);
		let raw;
		if (conv.adType === 'ShoppingAds') {
			raw = await fetchFromAPI<any>(`/shopping-ads/${conv.adId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
		} else if (conv.adType === 'DeliverySteps') {
	raw = await fetchFromAPI<any>(`/delivery-steps/${conv.adId}`, {
		headers: { Authorization: `Bearer ${token}` }
	});

	if (raw.deliveryAdId) {
		const deliveryAd = await fetchFromAPI<any>(`/delivery-ads/${raw.deliveryAdId}`, {
			headers: { Authorization: `Bearer ${token}` }
		});
		raw.title = deliveryAd.title;
		raw.description = deliveryAd.description;
		raw.packageSize = deliveryAd.packageSize;
		raw.postedBy = deliveryAd.postedBy ?? null;
		raw.price = deliveryAd.price;
	}

	try {
		const [departureLocation, arrivalLocation] = await Promise.all([
			fetchFromAPI<any>(`/locations/${raw.departureLocationId}`, {
				headers: { Authorization: `Bearer ${token}` }
			}),
			fetchFromAPI<any>(`/locations/${raw.arrivalLocationId}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
		]);

		raw.departureLocation = departureLocation;
		raw.arrivalLocation = arrivalLocation;
	} catch (e) {
		console.warn('Impossible de charger les lieux de départ ou d’arrivée', e);
	}
		} else if (conv.adType === 'ServiceProvisions') {
			raw = await fetchFromAPI<any>(`/personal-service-ads/${conv.adId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
		} else {
			raw = await fetchFromAPI<any>(`/release-cart-ads/${conv.adId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
		}
		return raw;
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

		socket.on('connect', () => {
			//notifications.success('Connecté au chat.');
		});
		socket.on('disconnect', () => {
			//notifications.warning('Déconnecté du chat.');
		});
		socket.on('newMessage', (msg: Message) => {
			if (msg.conversation.id === convId) {
				messages = [...messages, msg];
			}
		});
	}

	async function selectConv(conv: Conversation) {
		if (!conv) return;
		selectedConv = conv;
		selectedConvId = conv.id;
		updateUrl(conv.id);
		if (socket) socket.disconnect();
		ad = null;
		await Promise.all([fetchAd(conv).then((data) => (ad = data)), loadMessages(conv.id)]);
		console.log(ad);
		connectWS(conv.id);
	}

	function send() {
		if (!newMessage.trim()) return;
		socket.emit('sendMessage', {
			conversationId: selectedConv!.id,
			content: newMessage
		});
		newMessage = '';
	}

	let initialized = false;
	$: if (!initialized && convList.length && selectedConvId && !selectedConv) {
		const conv = convList.find((c) => c.id === selectedConvId);
		if (conv) {
			selectConv(conv);
			initialized = true;
		}
	}

	onMount(async () => {
		await loadConversations();
		isLoading = false;
		const params = new URLSearchParams(window.location.search);
		const raw = params.get('id');
		const id = raw ? Number(raw) : NaN;
		if (convList.length) {
			const first = convList.find((c) => c.id === id) ?? convList[0];
			await selectConv(first);
		} else {
			selectedConv = null;
		}
	});

	onDestroy(() => {
		if (socket) socket.disconnect();
	});
</script>

<div class="h-screen">
	<div class="mt-20 flex h-[70vh] overflow-hidden rounded-2xl border-2 border-gray-300">
		{#if convList.length && selectedConv}
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
					{#if convList.length}
						{#each convList as conv}
							<option value={conv.id}>Conversation #{conv.id}</option>
						{/each}
					{:else}
						<option disabled selected>Aucune conversation disponible</option>
					{/if}
				</select>
			</div>
		{:else if !isLoading && convList.length === 0}
			<div class="flex flex-1 items-center justify-center bg-white">
				<p class="text-sm text-gray-500">Aucune conversation pour le moment.</p>
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
							{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
								<span class="badge badge-neutral">Mon annonce</span>
							{/if}
							<span class="badge badge-secondary">{selectedConv!.price ?? 0} €</span>
						</div>
						<h2 class="text-lg font-bold">{ad.title}</h2>
						<p class="text-sm text-gray-600">{ad.description}</p>
                        {#if ad.departureLocation && ad.arrivalLocation}
                            <div class="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between text-sm text-gray-800 gap-4">
                            <div class="flex-1">
                                <p class="font-medium text-gray-900 mb-1">📍 Départ</p>
                                <p>{ad.departureLocation.name}</p>
                                <p>{ad.departureLocation.address}</p>
                                <p>{ad.departureLocation.cp} {ad.departureLocation.city}, {ad.departureLocation.country}</p>
                            </div>
                            
                            <div class="hidden sm:flex items-center justify-center px-4">
                                <span class="text-gray-400 text-xl">→</span>
                            </div>
                            
                            <div class="flex-1">
                                <p class="font-medium text-gray-900 mb-1">🎯 Arrivée</p>
                                <p>{ad.arrivalLocation.name}</p>
                                <p>{ad.arrivalLocation.address}</p>
                                <p>{ad.arrivalLocation.cp} {ad.arrivalLocation.city}, {ad.arrivalLocation.country}</p>
                            </div>
                            </div>

                        {/if}

                        {#if ad.packageSize}
                            <p class="mt-2 text-sm">Taille du colis : {ad.packageSize}</p>
                        {/if}
                        {#if ad.shoppingList && ad.shoppingList.length}
                            <p class="mt-2 text-sm">Liste de course :</p>
                            <ul class="list-disc pl-5 text-sm text-gray-700">
                                {#each ad.shoppingList as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        {/if}
					</div>

					{#if selectedConv!.adType === 'ShoppingAds'}
						{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
							<button class="btn btn-outline">Payer</button>
						{:else}
							<button class="btn btn-primary" on:click={openSlotModal}>Proposer un nouveau prix</button>
						{/if}
					{:else if selectedConv!.adType === 'DeliverySteps'}
						{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
                            <div>
                                <button class="btn btn-outline">Payer</button>
                            </div>
						{:else}
							<button class="btn btn-primary" on:click={openSlotModal}>Proposer un nouveau prix</button>
						{/if}
					{:else if selectedConv!.adType === 'ServiceProvisions'}
						{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
							<button class="btn btn-outline">Voir demandes</button>
						{:else}
							<button class="btn btn-primary" on:click={openSlotModal}>Choisir un créneau</button>
						{/if}
					{:else if selectedConv!.adType === 'ReleaseCartAds'}
						{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
							<button class="btn btn-outline">Payer</button>
						{:else}
							<button class="btn btn-primary" on:click={openSlotModal}>Proposer un nouveau prix</button
							>
						{/if}
					{/if}
				</header>
			{:else}
				<div class="p-4">Chargement de l’annonce…</div>
			{/if}

			<main class="flex-1 space-y-4 overflow-y-auto bg-white p-4">
				{#if messages.length}
					{#each messages as m}
						{#if !m.sender.id}
							<div class="chat chat-center">
								<div class="chat-header text-xs text-gray-500">{m.sender.name}</div>
								<div class="chat-bubble bg-base-content text-white">{m.content}</div>
							</div>
						{:else if m.sender.id === currentUserId}
							<div class="chat chat-end">
								<div class="chat-header text-xs text-gray-500">{m.sender.name}</div>
								<div class="chat-bubble bg-primary text-white">{m.content}</div>
							</div>
						{:else}
							<div class="chat chat-start">
								<div class="chat-header text-xs text-gray-500">{m.sender.name}</div>
								<div class="chat-bubble bg-gray-300">{m.content}</div>
							</div>
						{/if}
					{/each}
				{:else}
					<p class="mt-4 text-center text-sm text-gray-500">
						Aucun message dans cette conversation.
					</p>
				{/if}
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
				<h3 class="text-lg font-bold">{selectedConv!.adType}</h3>
				<div class="modal-action">
					<button class="btn" on:click={closeSlotModal}>Annuler</button>
					<button class="btn btn-primary" on:click={closeSlotModal}>Confirmer</button>
				</div>
			</div>
		</div>
	{/if}
</div>
