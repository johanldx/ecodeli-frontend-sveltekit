<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';
	import { fetchFromAPI } from '$lib/utils/api';
	import { notifications } from '$lib/stores/notifications';


	onMount(() => {
		onDestroy(tabTitle('track'));

		// Pré-remplissage via query params
		const urlParams = new URLSearchParams(window.location.search);
		const emailParam = urlParams.get('email');
		const refParam = urlParams.get('ref');
		if (emailParam && refParam) {
			email = decodeURIComponent(emailParam);
			ref = decodeURIComponent(refParam);
			handleSubmit(new Event('submit'));
		}
	});

	let email = '';
	let ref = '';
	let trackingType: 'A' | 'B' | 'C' | null = null;
	let trackingData: { ref: string } | null = null;
	let trackingInfo: any = null;
	let conversationId: number | null = null;
	let isValidating = false;

	const form_title = t('track.form.title');
	const form_email_placeholder = t('track.form.email_placeholder');
	const form_ref_placeholder = t('track.form.ref_placeholder');
	const form_button = t('track.form.button');
	const details_title = t('track.details.title');
	const status_ad = t('track.details.status_ad');
	const status_conversation = t('track.details.status_conversation');
	const status_payment = t('track.details.status_payment');
	const validate_button = t('track.details.validate_button');
	const validated_message = t('track.details.validated');
	const success_tracking = t('track.success.tracking_fetched');
	const success_validated = t('track.success.order_validated');
	const error_tracking = t('track.error.tracking_failed');
	const error_validation = t('track.error.validation_failed');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		trackingType = null;
		trackingData = null;
		trackingInfo = null;
		conversationId = null;

		try {
			// On suppose que la référence saisie est l'ID de conversation
			const response = await fetchFromAPI<any>(
				`/order-tracking?email=${encodeURIComponent(email)}&conversationId=${encodeURIComponent(ref)}`,
				{ method: 'GET' }
			);
			trackingInfo = response;
			conversationId = parseInt(ref);
			notifications.success($success_tracking);
		} catch (err) {
			console.error(err);
			trackingInfo = null;
			conversationId = null;
			notifications.error($error_tracking);
		}
	}

	async function handleValidateOrder() {
		if (!email || !conversationId) return;
		isValidating = true;
		try {
			await fetchFromAPI<any>(
				`/order-tracking/validate`,
				{
					method: 'POST',
					body: JSON.stringify({ email, conversationId }),
					headers: { 'Content-Type': 'application/json' }
				}
			);
			trackingInfo.statutAnnonce = 'completed';
			trackingInfo.statutConversation = 'Completed';
			trackingInfo.statutPaiement = 'COMPLETED';
			notifications.success($success_validated);
		} catch (err) {
			console.error(err);
			notifications.error($error_validation);
		} finally {
			isValidating = false;
		}
	}

	function refreshPage() {
		// Recharge la page sans les query params
		window.location.href = '/track';
	}

	// Fonctions utilitaires pour badges
	function getStatusBadge(status: string) {
		if (!status) return '';
		const map: Record<string, { label: string; color: string }> = {
			'pending': { label: 'En attente', color: 'badge-warning' },
			'in_progress': { label: 'En cours', color: 'badge-info' },
			'completed': { label: 'Terminée', color: 'badge-success' },
			'cancelled': { label: 'Annulée', color: 'badge-error' },
			'Completed': { label: 'Terminée', color: 'badge-success' },
			'Ongoing': { label: 'En cours', color: 'badge-info' },
			'ongoing': { label: 'En cours', color: 'badge-info' },
			'Pending': { label: 'En attente', color: 'badge-warning' },
			'COMPLETED': { label: 'Payé', color: 'badge-success' },
			'PENDING': { label: 'En attente de paiement', color: 'badge-warning' },
			'PAID': { label: 'Payé', color: 'badge-success' },
		};
		const badge = map[status] || { label: status, color: 'badge-neutral' };
		return `<span class='badge ${badge.color}'>${badge.label}</span>`;
	}
	function getTypeBadge(type: string) {
		if (!type) return '';
		const map: Record<string, { label: string; color: string }> = {
			'ShoppingAds': { label: 'Courses', color: 'badge-primary' },
			'DeliverySteps': { label: 'Livraison', color: 'badge-accent' },
			'ReleaseCartAds': { label: 'Chariot', color: 'badge-secondary' },
			'ServiceProvisions': { label: 'Service', color: 'badge-info' },
		};
		const badge = map[type] || { label: type, color: 'badge-neutral' };
		return `<span class='badge ${badge.color}'>${badge.label}</span>`;
	}
</script>

<div class="text-center">
	<a href="/"><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt="" /></a>

	<h1 class="mt-10 text-xl font-semibold">
		{#if trackingInfo}
			Suivi commande
		{:else}
			{$form_title}
		{/if}
	</h1>

	{#if !trackingInfo}
		<form class="my-5 space-y-5" on:submit|preventDefault={handleSubmit}>
			<input
				id="email"
				type="email"
				bind:value={email}
				placeholder={$form_email_placeholder}
				class="input"
				required
			/>
			<input
				id="ref"
				type="text"
				bind:value={ref}
				placeholder={$form_ref_placeholder}
				class="input"
				required
			/>
			<br />
			<input type="submit" value={$form_button} class="btn btn-primary" />
		</form>
	{/if}

	{#if trackingInfo}
		<div class="my-10 card bg-base-200 p-6 shadow-xl inline-block text-left max-w-lg w-full">
			<!-- Titre et type d'annonce -->
			<div class="flex items-center gap-2 mb-2">
				<span class="font-bold text-lg">{trackingInfo.titreAnnonce}</span>
				{@html getTypeBadge(trackingInfo.typeAnnonce)}
			</div>
			<h2 class="text-2xl font-semibold mb-4">{$details_title}</h2>
			<ul class="mb-4">
				<li>{$status_ad} : {@html getStatusBadge(trackingInfo.statutAnnonce)}</li>
				<li>{$status_conversation} : {@html getStatusBadge(trackingInfo.statutConversation)}</li>
				<li>{$status_payment} : {@html getStatusBadge(trackingInfo.statutPaiement)}</li>
			</ul>
			{#if trackingInfo.statutAnnonce !== 'completed'}
				<button class="btn btn-success" on:click={handleValidateOrder} disabled={isValidating}>
					{#if isValidating}Validation...{:else}{$validate_button}{/if}
				</button>
			{:else}
				<div class="alert alert-success mt-4">{$validated_message}</div>
			{/if}
		</div>
		<br />
		<button class="btn btn-secondary mt-4" on:click={refreshPage}>Retour</button>
	{:else}
		<a href="/">Retour</a>
	{/if}
</div>
