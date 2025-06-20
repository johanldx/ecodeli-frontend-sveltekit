<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { fetchFromAPI } from '$lib/utils/api';
	import { goto } from '$app/navigation';
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy } from 'svelte';

	interface RatingData {
		id: number;
		provider: {
			id: number;
			first_name: string;
			last_name: string;
			email: string;
		};
		conversation: {
			id: number;
			adType: string;
			adId: number;
		};
		token: string;
		isUsed: boolean;
	}

	let ratingData: RatingData | null = null;
	let loading = true;
	let error = '';
	let selectedRating = 0;
	let comment = '';
	let submitting = false;

	// Traductions
	const rate_title = t('rate.title');
	const rate_subtitle = t('rate.subtitle');
	const rate_comment_label = t('rate.comment.label');
	const rate_comment_placeholder = t('rate.comment.placeholder');
	const rate_submit_button = t('rate.submit.button');
	const rate_submit_loading = t('rate.submit.loading');
	const rate_error_missing_token = t('rate.errors.missing_token');
	const rate_error_already_submitted = t('rate.errors.already_submitted');
	const rate_error_invalid_token = t('rate.errors.invalid_token');
	const rate_error_submission = t('rate.errors.submission_error');

	onMount(() => {
		onDestroy(tabTitle('rate.tab_title'));
		
		const token = $page.url.searchParams.get('token');
		if (!token) {
			error = $rate_error_missing_token;
			loading = false;
			return;
		}

		loadRatingData(token);
	});

	async function loadRatingData(token: string) {
		try {
			ratingData = await fetchFromAPI<RatingData>(`/ratings/token/${token}`);
			if (ratingData.isUsed) {
				error = $rate_error_already_submitted;
			}
		} catch (err) {
			error = $rate_error_invalid_token;
		} finally {
			loading = false;
		}
	}

	function setRating(rating: number) {
		selectedRating = rating;
	}

	async function submitRating() {
		if (!ratingData || selectedRating === 0) return;

		submitting = true;
		try {
			await fetchFromAPI('/ratings/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					rating: selectedRating,
					comment: comment.trim() || undefined,
					token: ratingData.token
				})
			});

			// Redirection vers une page de confirmation
			goto('/rate/success');
		} catch (err) {
			error = $rate_error_submission;
		} finally {
			submitting = false;
		}
	}
</script>

<div class="text-center">
	<a href="/"><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt="" /></a>

	{#if loading}
		<div class="mt-10">
			<div class="loading loading-spinner loading-lg"></div>
			<p class="mt-4 text-gray-600">Chargement...</p>
		</div>
	{:else if error}
		<div class="mt-10">
			<h1 class="text-2xl font-semibold mb-4">Erreur</h1>
			<p class="text-gray-600 mb-6">{error}</p>
			<a href="/" class="btn btn-primary">Retour à l'accueil</a>
		</div>
	{:else if ratingData}
		<h1 class="mt-10 text-xl font-semibold">{$rate_title}</h1>
		
		<div class="my-5">
			<p class="text-gray-600 mb-6">
				{$rate_subtitle.replace('{providerName}', `${ratingData.provider.first_name} ${ratingData.provider.last_name}`)}
			</p>

			<!-- Système d'étoiles -->
			<div class="flex justify-center mb-6">
				<div class="flex gap-2">
					{#each Array(5) as _, i}
						{@const starNumber = i + 1}
						<button
							class="text-4xl transition-colors duration-200 {selectedRating >= starNumber
								? 'text-yellow-400'
								: 'text-gray-300 hover:text-yellow-300'}"
							on:click={() => setRating(starNumber)}
							type="button"
						>
							★
						</button>
					{/each}
				</div>
			</div>

			<!-- Labels des étoiles -->
			{#if selectedRating > 0}
				<div class="mb-6">
					<p class="text-lg font-semibold">
						{selectedRating === 1 && t('rate.stars.1')}
						{selectedRating === 2 && t('rate.stars.2')}
						{selectedRating === 3 && t('rate.stars.3')}
						{selectedRating === 4 && t('rate.stars.4')}
						{selectedRating === 5 && t('rate.stars.5')}
					</p>
				</div>
			{/if}

			<!-- Commentaire optionnel -->
			<div class="form-control mb-6">
				<label for="comment" class="label">
					<span class="label-text">{$rate_comment_label}</span>
				</label>
				<textarea
					id="comment"
					bind:value={comment}
					class="textarea textarea-bordered h-24"
					placeholder={$rate_comment_placeholder}
				></textarea>
			</div>

			<button
				class="btn btn-primary {selectedRating === 0 ? 'btn-disabled' : ''}"
				on:click={submitRating}
				disabled={selectedRating === 0 || submitting}
			>
				{#if submitting}
					<div class="loading loading-spinner loading-sm"></div>
					{$rate_submit_loading}
				{:else}
					{$rate_submit_button}
				{/if}
			</button>

			{#if error}
				<div class="alert alert-error mt-4">
					<span>{error}</span>
				</div>
			{/if}
		</div>
	{/if}
</div> 