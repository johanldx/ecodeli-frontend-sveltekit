<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import { fetchFromAPI } from '$lib/utils/api';
	import { accessToken } from '$lib/stores/token';
	import { user } from '$lib/stores/user';
	import { notifications } from '$lib/stores/notifications';
	import { get } from 'svelte/store';
	import dayjs from 'dayjs';

	let isLoading = true;

	interface Conversation {
		id: number;
		adType: 'ShoppingAds' | 'DeliverySteps' | 'ServiceProvisions' | 'ReleaseCartAds';
		adId: number;
		userFrom: { id: number };
		price: number;
		status?: string;
		hasError?: boolean;
		label?: string;
	}

	const adTypeLabels: Record<Conversation['adType'], string> = {
		ShoppingAds: 'Course',
		DeliverySteps: 'Livraison',
		ServiceProvisions: 'Service',
		ReleaseCartAds: 'Lacher de chariot'
	};


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
	interface Schedule {
		id: number;
		providerId: number;
		personalServiceTypeId: number;
		startTime: string;
		endTime: string;
		status: 'available' | 'unavailable';
	}
	let availableSchedules: Schedule[] = [];
	let selectedScheduleId: number | null = null;
	let adPrice: number | null = null;

	type GroupKey = 'actives' | 'terminees' | 'erreurs';
	const groupLabels: Record<GroupKey, string> = {
		actives: 'Conversations actives',
		terminees: 'Conversations terminées',
		erreurs: 'Erreurs de récupération'
	};

	const groupColors: Record<GroupKey, string> = {
		actives: 'green-500',
		terminees: 'gray-500',
		erreurs: 'red-500'
	};

	let groupStates: Record<GroupKey, boolean> = {
		actives: true,
		terminees: true,
		erreurs: true
	};

	type ConversationGroup = Record<GroupKey, Conversation[]>;
	let groupedConvs: ConversationGroup = { actives: [], terminees: [], erreurs: [] };

	$: {
		groupedConvs = { actives: [], terminees: [], erreurs: [] };

		for (const conv of convList) {
			if (conv.hasError) {
				groupedConvs.erreurs.push(conv);
			} else if ((conv.status === 'completed') || (conv.status === 'closed')) {
				groupedConvs.terminees.push(conv);
			} else {
				groupedConvs.actives.push(conv);
			}
		}
	}

	let modalContext: 'payer' | 'prix' | 'demandes' | 'créneau' | null = null;

	async function openSlotModal(context: typeof modalContext) {
		modalContext = context;
		showSlotModal = true;

		if (context === 'créneau') {
			adPrice = selectedConv?.price ?? null;

			if (selectedConv?.userFrom?.id && selectedConv?.adType) {
				const start = dayjs().toISOString();
				const end = dayjs().add(14, 'day').endOf('day').toISOString();
				const res = await fetchFromAPI(
					`/provider-schedules?providerId=${ad.postedById}&personalServiceTypeId=${ad.typeId}&start=${start}&end=${end}`,
					{ headers: { Authorization: `Bearer ${get(accessToken)}` } }
				);
				
				availableSchedules = res as Schedule[];
			}
		}
	}

	function closeSlotModal() {
		showSlotModal = false;
		availableSchedules = [];
		selectedScheduleId = null;
		adPrice = null;
	}

	async function confirmSlot() {
		if (modalContext === 'créneau') {
			if (!selectedScheduleId) {
				notifications.error('Veuillez sélectionner un créneau.');
				return;
			}
			await fetchFromAPI(`/conversations/${selectedConv!.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				},
				body: JSON.stringify({
					providerScheduleId: selectedScheduleId,
					price: adPrice
				})
			});
			notifications.success('Créneau réservé. Redirection vers le paiement à venir.');
		}
		closeSlotModal();
	}

	function updateUrl(id: number) {
		const params = new URLSearchParams(window.location.search);
		params.set('id', id.toString());
		history.replaceState(null, '', `chat?${params.toString()}`);
	}

	async function loadConversations() {
		const token = get(accessToken);
		const rawList = await fetchFromAPI<Conversation[]>('/conversations', {
			headers: { Authorization: `Bearer ${token}` }
		});

		const result: Conversation[] = [];

		for (const conv of rawList) {
			try {
				const adData = await fetchAd(conv);
				conv.label = `
					<span class="flex items-center gap-2">
						<span class="badge badge-info">${adTypeLabels[conv.adType] ?? conv.adType}</span>
						<span class="">${adData?.title ?? 'Annonce inconnue'}</span>
					</span>
				`;
				conv.status = adData?.status;
			} catch (e) {
				conv.label = `
					<span class="flex items-center gap-2">
						<span class="badge badge-outline text-xs">${adTypeLabels[conv.adType] ?? conv.adType}</span>
						<span>Erreur de récupération</span>
					</span>
				`;
				conv.hasError = true;
			}
			result.push(conv);
		}

		convList = result;
	}

	async function fetchAd(conv: Conversation): Promise<any> {
		const token = get(accessToken);
		let raw;
		try {
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

				if (raw.typeId && raw.postedById) {
					try {
						const auth = await fetchFromAPI<any>(
							`/personal-service-type-authorizations/by-user/${raw.postedById}/${raw.typeId}`,
							{ headers: { Authorization: `Bearer ${token}` } }
						);
						if (auth && auth.price != null) {
							raw.price = auth.price;
							conv.price = auth.price;
						}
					} catch (e) {
						console.warn('Aucune autorisation trouvée pour ce type de service', e);
					}
				}
			} else {
				raw = await fetchFromAPI<any>(`/release-cart-ads/${conv.adId}`, {
					headers: { Authorization: `Bearer ${token}` }
				});
			}
			return raw;
		} catch (e) {
		notifications.warning('Erreur de récupération de l’annonce');
		conv.hasError = true;
		return null;
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

		if ((conv as any).fullAd) {
			ad = (conv as any).fullAd;
			await loadMessages(conv.id);
		} else {
			await Promise.all([
				fetchAd(conv).then((data) => {
					ad = data;
					(conv as any).fullAd = data;
				}),
				loadMessages(conv.id)
			]);
		}
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
					{#each Object.entries(groupedConvs) as [key, group]}
						{#if group.length}
							<div class="border-b border-gray-200">
								<button
									class="flex w-full items-center justify-between bg-gray-100 p-2 font-bold"
									on:click={() => (groupStates[key as GroupKey] = !groupStates[key as GroupKey])}
								>
									<span>{groupLabels[key as GroupKey]}</span>
									<span class="text-sm text-gray-500"
										>{groupStates[key as GroupKey] ? '▼' : '▲'}</span
									>
								</button>
								{#if groupStates[key as GroupKey]}
									{#each group as conv}
										<button
											class="flex w-full items-center border-b border-gray-200 p-3 hover:bg-gray-200 {selectedConv?.id ===
											conv.id
												? 'bg-base-100'
												: ''}"
											on:click={() => selectConv(conv)}
										>
											<div
												class="mr-3 h-2 w-2 rounded-full bg-{groupColors[key as GroupKey]}"
											></div>
											<div class="flex flex-col">
												{@html conv.label}
											</div>
										</button>
									{/each}
								{/if}
							</div>
						{/if}
					{/each}
				</ul>
			</aside>

			<div class="border-b border-gray-300 bg-white p-2 md:hidden">
				<select bind:value={selectedConvId} class="select select-bordered w-full">
					{#if convList.length}
						{#each convList as conv}
							<option value={conv.id}>{@html conv.label}</option>
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
							<div
								class="mt-4 flex flex-col gap-4 text-sm text-gray-800 sm:flex-row sm:items-start sm:justify-between"
							>
								<div class="flex-1">
									<p class="mb-1 font-medium text-gray-900">📍 Départ</p>
									<p>{ad.departureLocation.name}</p>
									<p>{ad.departureLocation.address}</p>
									<p>
										{ad.departureLocation.cp}
										{ad.departureLocation.city}, {ad.departureLocation.country}
									</p>
								</div>

								<div class="hidden items-center justify-center px-4 sm:flex">
									<span class="text-xl text-gray-400">→</span>
								</div>

								<div class="flex-1">
									<p class="mb-1 font-medium text-gray-900">🎯 Arrivée</p>
									<p>{ad.arrivalLocation.name}</p>
									<p>{ad.arrivalLocation.address}</p>
									<p>
										{ad.arrivalLocation.cp}
										{ad.arrivalLocation.city}, {ad.arrivalLocation.country}
									</p>
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
							<button class="btn btn-outline" on:click={() => openSlotModal('payer')}>Payer</button>
						{:else}
							<button class="btn btn-primary" on:click={() => openSlotModal('prix')}>Proposer un nouveau prix</button>
						{/if}
					{:else if selectedConv!.adType === 'DeliverySteps'}
						{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
							<button class="btn btn-outline" on:click={() => openSlotModal('payer')}>Payer</button>
						{:else}
							<button class="btn btn-primary" on:click={() => openSlotModal('prix')}>Proposer un nouveau prix</button>
						{/if}
					{:else if selectedConv!.adType === 'ServiceProvisions'}
						{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
							<button class="btn btn-outline" on:click={() => openSlotModal('demandes')}>Voir demandes</button>
						{:else}
							<button class="btn btn-primary" on:click={() => openSlotModal('créneau')}>Choisir un créneau</button>
						{/if}
					{:else if selectedConv!.adType === 'ReleaseCartAds'}
						{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
							<button class="btn btn-outline" on:click={() => openSlotModal('payer')}>Payer</button>
						{:else}
							<button class="btn btn-primary" on:click={() => openSlotModal('prix')}>Proposer un nouveau prix</button>
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
			<div class="modal-box space-y-4">
				<h3 class="text-lg font-bold">
					{#if modalContext === 'payer'}Paiement de la prestation{/if}
					{#if modalContext === 'prix'}Proposition de nouveau prix{/if}
					{#if modalContext === 'demandes'}Demandes du client{/if}
					{#if modalContext === 'créneau'}Choix d’un créneau{/if}
				</h3>

				<p class="text-sm text-gray-600">
					{#if modalContext === 'payer'}Vous allez procéder au paiement sécurisé. En payant vous acceptez la proposition de prix.{/if}
					{#if modalContext === 'prix'}(Indiquez un prix que vous proposez pour cette mission.){/if}
					{#if modalContext === 'demandes'}(Voici les demandes spécifiques du client.){/if}
					{#if modalContext === 'créneau'}Choisissez un créneau horaire pour la prestation.{/if}
				</p>

				{#if modalContext === 'créneau'}
					<p>Prix à payer : <strong>{adPrice ?? '—'} €</strong></p>

					{#if availableSchedules.length > 0}
						<label for="slot">Créneaux disponibles :</label>
						<select class="select select-bordered w-full" bind:value={selectedScheduleId}>
							<option disabled selected value="">Choisissez un créneau disponible</option>
							{#each availableSchedules as sched}
								<option value={sched.id}>
									{dayjs(sched.startTime).format('DD/MM HH:mm')} → {dayjs(sched.endTime).format('HH:mm')}
								</option>
							{/each}
						</select>
					{:else}
						<p class="text-sm text-gray-500">Aucun créneau disponible pour les 2 prochaines semaines.</p>
					{/if}
				{/if}
				{#if modalContext === 'payer'}
					<p>Prix à payer : <strong>{selectedConv?.price ?? '—'} €</strong></p>
				{/if}
				<div class="modal-action">
					<button class="btn" on:click={closeSlotModal}>Annuler</button>
					<button class="btn btn-primary" on:click={confirmSlot}>Confirmer</button>
				</div>
			</div>
		</div>
	{/if}
</div>
