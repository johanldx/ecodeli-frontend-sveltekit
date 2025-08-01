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
		status: string;
		hasError?: boolean;
		label?: string;
	}

	const adTypeLabels: Record<Conversation['adType'], string> = {
		ShoppingAds: 'Course',
		DeliverySteps: 'Livraison',
		ServiceProvisions: 'Service',
		ReleaseCartAds: 'Chariot'
	};


	interface Message {
		id: number;
		content: string;
		sender: { id?: number; name: string } | null;
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
	let proposedPrice: number | null = null;

	type GroupKey = 'actives' | 'terminees' | 'erreurs' | 'en_cours';
	const groupLabels: Record<GroupKey, string> = {
		actives: 'Conversations actives',
		en_cours: 'Conversation en cours',
		terminees: 'Conversations terminées',
		erreurs: 'Erreurs de récupération',
	};

	const groupColors: Record<GroupKey, string> = {
		actives: 'green-500',
		en_cours: 'green-500',
		terminees: 'gray-500',
		erreurs: 'red-500',
	};

	let groupStates: Record<GroupKey, boolean> = {
		actives: true,
		en_cours: true,
		terminees: true,
		erreurs: true,
	};

	type ConversationGroup = Record<GroupKey, Conversation[]>;
	let groupedConvs: ConversationGroup = { actives: [], en_cours: [], terminees: [], erreurs: [], };

	$: {
		groupedConvs = { actives: [], en_cours: [], terminees: [], erreurs: [] };

		for (const conv of convList) {
			if (conv.hasError) {
				groupedConvs.erreurs.push(conv);
			} else if ((conv.status === 'completed') || (conv.status === 'closed')) {
				groupedConvs.terminees.push(conv);
			} else if ((conv.status === 'ongoing')) {
				groupedConvs.en_cours.push(conv);
			} else {
				groupedConvs.actives.push(conv);
			}
		}
	}

	let modalContext: 'payer' | 'prix' | 'demandes' | 'créneau' | null = null;
	let isAdExpanded = false;
	let showConversationList = true; // Pour mobile: true = liste, false = conversation

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
		} else if (context === 'prix') {
			proposedPrice = selectedConv?.price ?? null;
		}
	}

	function closeSlotModal() {
		showSlotModal = false;
		availableSchedules = [];
		selectedScheduleId = null;
		adPrice = null;
		proposedPrice = null;
	}

	async function confirmSlot() {
		if (modalContext === 'créneau') {
			if (!selectedScheduleId) {
				notifications.error('Veuillez sélectionner un créneau.');
				return;
			}
			// Réservation du créneau
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

			const response = await fetchFromAPI<{ url?: string }>('/stripe/checkout-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				},
				body: JSON.stringify({
					conversationId: selectedConv!.id,
					url: window.location.href
				})
			});

			if (response?.url) {
				// Rediriger l'utilisateur vers l'URL de paiement Stripe
				window.location.href = response.url;
			} else {
				notifications.error('Erreur lors de la création de la session de paiement.');
			}
		} else if (modalContext === 'payer') {
			// Appel à Stripe pour la création de la session de paiement
			const response = await fetchFromAPI<{ url?: string }>('/stripe/checkout-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				},
				body: JSON.stringify({
					conversationId: selectedConv!.id,
					url: window.location.href
				})
			});

			if (response?.url) {
				// Rediriger l'utilisateur vers l'URL de paiement Stripe
				window.location.href = response.url;
			} else {
				notifications.error('Erreur lors de la création de la session de paiement.');
			}
		} else if (modalContext === 'prix') {
			if (!proposedPrice || proposedPrice <= 0) {
				notifications.error('Veuillez entrer un prix valide et positif.');
				return; // Ne pas fermer la modale si erreur
			}
			try {
				await fetchFromAPI(`/conversations/${selectedConv!.id}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${get(accessToken)}`
					},
					body: JSON.stringify({ price: proposedPrice })
				});

				socket.emit('sendMessage', {
					conversationId: selectedConv!.id,
					content: `Proposition : Je vous propose un nouveau prix de ${proposedPrice}€.`
				});

				if (selectedConv) {
					selectedConv.price = proposedPrice;
				}
				notifications.success('Nouvelle proposition de prix envoyée.');
			} catch (error) {
				notifications.error('Une erreur est survenue lors de la proposition.');
				console.error('Price proposal error:', error);
				return; // Ne pas fermer la modale si erreur
			}
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

		console.log(rawList);

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
					console.warn("Impossible de charger les lieux de départ ou d'arrivée", e);
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
		notifications.warning('Erreur de récupération de l\'annonce');
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

		// Sur mobile, passer en mode conversation
		if (window.innerWidth < 768) {
			showConversationList = false;
		}

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

		const urlParams = new URLSearchParams(window.location.search);

		if (urlParams.get('payment') === 'success') {
			notifications.success("Votre paiement a bien été pris en compte");
		} else if (urlParams.get('payment') === 'cancel') {
			notifications.error("Votre paiement a bien été annulé");
		}
	});

	onDestroy(() => {
		if (socket) socket.disconnect();
	});
</script>

<div class="">
	<!-- Version Desktop -->
	<div class="hidden lg:flex mt-20 h-[70vh] overflow-hidden rounded-2xl border-2 border-gray-300">
		{#if convList.length && selectedConv}
			<aside
				class="w-64 flex-col overflow-hidden rounded-l-lg border-r border-gray-300 bg-white flex"
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
		{:else if !isLoading && convList.length === 0}
			<div class="flex flex-1 items-center justify-center bg-white">
				<p class="text-sm text-gray-500">Aucune conversation pour le moment.</p>
			</div>
		{:else}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
				<span class="loading loading-spinner loading-lg text-primary"></span>
			</div>
		{/if}

		<div class="flex flex-1 flex-col rounded-r-lg border-gray-300 relative">
			{#if ad}
				<header class="border-b border-gray-300 bg-white">
					<!-- Version compacte (toujours visible) -->
					<div class="flex items-start justify-between p-4">
						<div class="flex-1 min-w-0">
							<div class="mb-2 flex items-center space-x-2">
								{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
									<span class="badge badge-neutral">Mon annonce</span>
								{/if}
								<span class="badge badge-secondary">{selectedConv!.price ?? 0} €</span>
							</div>
							<h2 class="text-lg font-bold truncate">{ad.title}</h2>
							<p class="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
						</div>

						<div class="flex items-start gap-2 ml-4">
							<button 
								class="btn btn-ghost btn-sm" 
								on:click={() => isAdExpanded = !isAdExpanded}
								title={isAdExpanded ? "Réduire" : "Développer"}
							>
								{isAdExpanded ? '▼' : '▲'}
							</button>
							
							{#if groupedConvs.actives.find(c => c.id === selectedConv!.id)}
								{#if selectedConv!.adType === 'ShoppingAds'}
									{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
										<button class="btn btn-outline btn-sm" on:click={() => openSlotModal('payer')}>Payer</button>
									{:else}
										<button class="btn btn-primary btn-sm" on:click={() => openSlotModal('prix')}>Nouveau prix</button>
									{/if}
								{:else if selectedConv!.adType === 'DeliverySteps'}
									{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
										<button class="btn btn-outline btn-sm" on:click={() => openSlotModal('payer')}>Payer</button>
									{:else}
										<button class="btn btn-primary btn-sm" on:click={() => openSlotModal('prix')}>Nouveau prix</button>
									{/if}
								{:else if selectedConv!.adType === 'ServiceProvisions'}
									{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
										<button class="btn btn-outline btn-sm" on:click={() => openSlotModal('demandes')}>Demandes</button>
									{:else}
										<button class="btn btn-primary btn-sm" on:click={() => openSlotModal('créneau')}>Créneau</button>
									{/if}
								{:else if selectedConv!.adType === 'ReleaseCartAds'}
									{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
										<button class="btn btn-outline btn-sm" on:click={() => openSlotModal('payer')}>Payer</button>
									{:else}
										<button class="btn btn-primary btn-sm" on:click={() => openSlotModal('prix')}>Nouveau prix</button>
									{/if}
								{/if}
							{:else if groupedConvs.en_cours.find(c => c.id === selectedConv!.id)}
								<button class="btn btn-disabled btn-sm" disabled>En cours</button>
							{:else}
								<button class="btn btn-disabled btn-sm" disabled>Finalisé</button>
							{/if}
						</div>
					</div>

					<!-- Version déployée (par-dessus le chat) -->
					{#if isAdExpanded}
						<div class="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-300 shadow-lg max-h-[80vh] overflow-y-auto">
							<div class="p-4">
								<div class="flex items-start justify-between mb-4">
									<h3 class="text-lg font-bold">Détails de l'annonce</h3>
									<button 
										class="btn btn-ghost btn-sm" 
										on:click={() => isAdExpanded = false}
									>
										✕
									</button>
								</div>
								
								<div class="space-y-4">
									{#if ad.departureLocation && ad.arrivalLocation}
										<div class="flex flex-col gap-4 text-sm text-gray-800 sm:flex-row sm:items-start sm:justify-between">
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
										<div>
											<p class="font-medium text-gray-900 mb-1">📦 Taille du colis</p>
											<p class="text-sm">{ad.packageSize}</p>
										</div>
									{/if}
									
									{#if ad.shoppingList && ad.shoppingList.length}
										<div>
											<p class="font-medium text-gray-900 mb-2">🛒 Liste de course</p>
											<ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
												{#each ad.shoppingList as item}
													<li>{item}</li>
												{/each}
											</ul>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</header>

				<!-- Messages -->
				<main class="flex-1 space-y-4 overflow-y-auto bg-white p-4 {isAdExpanded ? 'mt-0' : ''}">
					{#if messages.length}
						{#each messages as m}
							{#if !m.sender || !m.sender.id}
								<div class="chat chat-center">
									<div class="chat-header text-xs text-gray-500">Ecodeli.fr</div>
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
			{:else}
				<div class="flex items-center justify-center h-full">
					<span class="loading loading-spinner loading-lg text-primary"></span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Version Mobile -->
	<div class="lg:hidden h-screen">
		{#if showConversationList}
			<!-- Liste des conversations -->
			<div class="h-full bg-white">
				<div class="p-4 border-b border-gray-200">
					<h1 class="text-xl font-bold">Conversations</h1>
				</div>
				
				<div class="flex-1 overflow-y-auto">
					{#if convList.length}
						{#each Object.entries(groupedConvs) as [key, group]}
							{#if group.length}
								<div class="border-b border-gray-200">
									<button
										class="flex w-full items-center justify-between bg-gray-100 p-3 font-bold"
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
												class="flex w-full items-center border-b border-gray-200 p-4 hover:bg-gray-50"
												on:click={() => selectConv(conv)}
											>
												<div
													class="mr-3 h-3 w-3 rounded-full bg-{groupColors[key as GroupKey]}"
												></div>
												<div class="flex flex-col flex-1 text-left">
													{@html conv.label}
													<p class="text-sm text-gray-500 mt-1">{conv.price ?? 0} €</p>
												</div>
											</button>
										{/each}
									{/if}
								</div>
							{/if}
						{/each}
					{:else if !isLoading}
						<div class="flex flex-1 items-center justify-center p-8">
							<p class="text-sm text-gray-500">Aucune conversation pour le moment.</p>
						</div>
					{:else}
						<div class="flex items-center justify-center p-8">
							<span class="loading loading-spinner loading-lg text-primary"></span>
						</div>
					{/if}
				</div>
			</div>
		{:else if selectedConv}
			<!-- Conversation en pleine écran -->
			<div class="h-full flex flex-col bg-white">
				<!-- Header avec bouton retour -->
				<header class="border-b border-gray-300 bg-white p-4">
					<div class="flex items-center gap-3">
						<button 
							class="btn btn-ghost btn-sm" 
							on:click={() => showConversationList = true}
						>
							← Retour
						</button>
						<div class="flex-1 min-w-0">
							<div class="mb-2 flex items-center space-x-2">
								{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
									<span class="badge badge-neutral text-xs">Mon annonce</span>
								{/if}
								<span class="badge badge-secondary text-xs">{selectedConv!.price ?? 0} €</span>
							</div>
							<h2 class="text-base font-bold truncate">{ad?.title || 'Chargement...'}</h2>
							<p class="text-xs text-gray-600 line-clamp-1">{ad?.description || ''}</p>
						</div>
						
						<div class="flex items-start gap-2">
							<button 
								class="btn btn-ghost btn-sm" 
								on:click={() => isAdExpanded = !isAdExpanded}
								title={isAdExpanded ? "Réduire" : "Développer"}
							>
								{isAdExpanded ? '▼' : '▲'}
							</button>
							
							{#if groupedConvs.actives.find(c => c.id === selectedConv!.id)}
								{#if selectedConv!.adType === 'ShoppingAds'}
									{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
										<button class="btn btn-outline btn-sm" on:click={() => openSlotModal('payer')}>Payer</button>
									{:else}
										<button class="btn btn-primary btn-sm" on:click={() => openSlotModal('prix')}>Prix</button>
									{/if}
								{:else if selectedConv!.adType === 'DeliverySteps'}
									{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
										<button class="btn btn-outline btn-sm" on:click={() => openSlotModal('payer')}>Payer</button>
									{:else}
										<button class="btn btn-primary btn-sm" on:click={() => openSlotModal('prix')}>Prix</button>
									{/if}
								{:else if selectedConv!.adType === 'ServiceProvisions'}
									{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
										<button class="btn btn-outline btn-sm" on:click={() => openSlotModal('demandes')}>Demandes</button>
									{:else}
										<button class="btn btn-primary btn-sm" on:click={() => openSlotModal('créneau')}>Créneau</button>
									{/if}
								{:else if selectedConv!.adType === 'ReleaseCartAds'}
									{#if selectedConv!.userFrom && selectedConv!.userFrom.id !== currentUserId}
										<button class="btn btn-outline btn-sm" on:click={() => openSlotModal('payer')}>Payer</button>
									{:else}
										<button class="btn btn-primary btn-sm" on:click={() => openSlotModal('prix')}>Prix</button>
									{/if}
								{/if}
							{:else if groupedConvs.en_cours.find(c => c.id === selectedConv!.id)}
								<button class="btn btn-disabled btn-sm" disabled>En cours</button>
							{:else}
								<button class="btn btn-disabled btn-sm" disabled>Finalisé</button>
							{/if}
						</div>
					</div>

					<!-- Version déployée mobile -->
					{#if isAdExpanded && ad}
						<div class="mt-4 p-4 bg-gray-50 rounded-lg">
							<div class="space-y-4">
								{#if ad.departureLocation && ad.arrivalLocation}
									<div class="space-y-3">
										<div>
											<p class="font-medium text-gray-900 mb-1">📍 Départ</p>
											<p class="text-sm">{ad.departureLocation.name}</p>
											<p class="text-sm">{ad.departureLocation.address}</p>
											<p class="text-sm">
												{ad.departureLocation.cp} {ad.departureLocation.city}, {ad.departureLocation.country}
											</p>
										</div>
										<div>
											<p class="font-medium text-gray-900 mb-1">🎯 Arrivée</p>
											<p class="text-sm">{ad.arrivalLocation.name}</p>
											<p class="text-sm">{ad.arrivalLocation.address}</p>
											<p class="text-sm">
												{ad.arrivalLocation.cp} {ad.arrivalLocation.city}, {ad.arrivalLocation.country}
											</p>
										</div>
									</div>
								{/if}

								{#if ad.packageSize}
									<div>
										<p class="font-medium text-gray-900 mb-1">📦 Taille du colis</p>
										<p class="text-sm">{ad.packageSize}</p>
									</div>
								{/if}
								
								{#if ad.shoppingList && ad.shoppingList.length}
									<div>
										<p class="font-medium text-gray-900 mb-2">🛒 Liste de course</p>
										<ul class="list-disc pl-4 text-sm text-gray-700 space-y-1">
											{#each ad.shoppingList as item}
												<li>{item}</li>
											{/each}
										</ul>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				</header>

				<!-- Messages -->
				<main class="flex-1 space-y-3 overflow-y-auto bg-white p-3">
					{#if messages.length}
						{#each messages as m}
							{#if !m.sender || !m.sender.id}
								<div class="chat chat-center">
									<div class="chat-header text-xs text-gray-500">Ecodeli.fr</div>
									<div class="chat-bubble bg-base-content text-white max-w-[85%] break-words">{m.content}</div>
								</div>
							{:else if m.sender.id === currentUserId}
								<div class="chat chat-end">
									<div class="chat-header text-xs text-gray-500">{m.sender.name}</div>
									<div class="chat-bubble bg-primary text-white max-w-[85%] break-words">{m.content}</div>
								</div>
							{:else}
								<div class="chat chat-start">
									<div class="chat-header text-xs text-gray-500">{m.sender.name}</div>
									<div class="chat-bubble bg-gray-300 max-w-[85%] break-words">{m.content}</div>
								</div>
							{/if}
						{/each}
					{:else}
						<p class="mt-4 text-center text-xs text-gray-500">
							Aucun message dans cette conversation.
						</p>
					{/if}
				</main>

				<!-- Zone de saisie -->
				<footer class="border-t border-gray-300 bg-white p-3">
					<div class="flex gap-2">
						<input
							type="text"
							bind:value={newMessage}
							placeholder="Tapez un message…"
							class="input input-bordered flex-1 text-sm"
							on:keydown={(e) => e.key === 'Enter' && send()}
						/>
						<button class="btn btn-primary btn-sm" on:click={send}>→</button>
					</div>
				</footer>
			</div>
		{:else}
			<div class="flex items-center justify-center h-full">
				<span class="loading loading-spinner loading-lg text-primary"></span>
			</div>
		{/if}
	</div>

	{#if showSlotModal}
		<div class="modal modal-open">
			<div class="modal-box space-y-4">
				<h3 class="text-lg font-bold">
					{#if modalContext === 'payer'}Paiement de la prestation{/if}
					{#if modalContext === 'prix'}Proposition de nouveau prix{/if}
					{#if modalContext === 'demandes'}Demandes du client{/if}
					{#if modalContext === 'créneau'}Choix d'un créneau{/if}
				</h3>

				<p class="text-sm text-gray-600">
					{#if modalContext === 'payer'}Vous allez procéder au paiement sécurisé. En payant vous acceptez la proposition de prix.{/if}
					{#if modalContext === 'prix'}(Indiquez un prix que vous proposez pour cette mission.){/if}
					{#if modalContext === 'demandes'}(Voici les demandes spécifiques du client.){/if}
					{#if modalContext === 'créneau'}Choisissez un créneau horaire pour la prestation.{/if}
				</p>

				{#if modalContext === 'prix'}
					<div>
						<label for="new-price" class="label">
							<span class="label-text">Votre proposition de prix (€)</span>
						</label>
						<input
							id="new-price"
							type="number"
							bind:value={proposedPrice}
							class="input input-bordered w-full"
							placeholder="Ex: 25.50"
						/>
					</div>
				{/if}

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