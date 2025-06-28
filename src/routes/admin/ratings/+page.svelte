<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchFromAPI } from '$lib/utils/api';
	import { get } from 'svelte/store';
	import { accessToken } from '$lib/stores/token';
	import { notifications } from '$lib/stores/notifications';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { t, tStatic } from '$lib/utils/t';
	import dayjs from 'dayjs';
	import { createAvatar } from '@dicebear/core';
	import { glass } from '@dicebear/collection';

	onMount(() => tabTitle('admin.ratings.tab_title'));

	let ratings: any[] = [];
	let loading = true;
	let expandedProvider: number | null = null;

	// Traductions
	const title = tStatic('admin.ratings.title') || 'Gestion des avis des prestataires';
	const subtitle = tStatic('admin.ratings.subtitle') || 'Consultez et gérez les évaluations des prestataires';
	const provider_label = tStatic('admin.ratings.provider') || 'Prestataire';
	const average_rating_label = tStatic('admin.ratings.average_rating') || 'Note moyenne';
	const number_ratings_label = tStatic('admin.ratings.number_ratings') || 'Nombre d\'avis';
	const actions_label = tStatic('admin.ratings.actions') || 'Actions';
	const view_ratings = tStatic('admin.ratings.view_ratings') || 'Voir les avis';
	const hide_ratings = tStatic('admin.ratings.hide_ratings') || 'Masquer';
	const rating_details = tStatic('admin.ratings.rating_details') || 'Détail des avis';
	const no_comment = tStatic('admin.ratings.no_comment') || 'Aucun commentaire';
	const rated_by = tStatic('admin.ratings.rated_by') || 'Évalué par';
	const service_label = tStatic('admin.ratings.service') || 'Service';
	const legend = tStatic('admin.ratings.legend') || 'Légende';
	const legend_low_rating = tStatic('admin.ratings.legend_low_rating') || 'Les prestataires avec une note moyenne inférieure à 2 étoiles sont affichés en rouge';
	const legend_view_details = tStatic('admin.ratings.legend_view_details') || 'Cliquez sur "Voir les avis" pour consulter le détail des évaluations';
	const no_ratings = tStatic('admin.ratings.no_ratings') || 'Aucun avis trouvé';

	const formatDate = (dateString: string) => dayjs(dateString).format('DD/MM/YYYY HH:mm');

	const getRatingColor = (rating: number) => {
		if (rating < 2) return 'text-error font-bold';
		if (rating < 3) return 'text-warning';
		if (rating < 4) return 'text-warning';
		return 'text-success';
	};

	const getRatingBadge = (rating: number) => {
		if (rating < 2) return 'badge-error';
		if (rating < 3) return 'badge-warning';
		if (rating < 4) return 'badge-warning';
		return 'badge-success';
	};

	const getRatingStars = (rating: number) => {
		return '★'.repeat(rating) + '☆'.repeat(5 - rating);
	};

	const createProviderAvatar = (firstName: string, lastName: string) => {
		const avatar = createAvatar(glass, {
			seed: firstName + lastName + 'provider'
		});
		return avatar;
	};

	const toggleExpanded = (providerId: number) => {
		expandedProvider = expandedProvider === providerId ? null : providerId;
	};

	onMount(async () => {
		try {
			const response = await fetchFromAPI('/ratings/admin/all', {
				method: 'GET',
				headers: { 
					'Content-Type': 'application/json', 
					Authorization: `Bearer ${get(accessToken)}` 
				}
			}) as any[];

			ratings = response || [];
			loading = false;
		} catch (error) {
			console.error('Erreur lors de la récupération des avis:', error);
			notifications.error('Erreur lors de la récupération des avis');
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Gestion des avis - Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="mt-10 mb-5 text-2xl font-medium">{title}</h1>
	</div>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else if ratings.length === 0}
		<div class="hero min-h-96 bg-base-200 rounded-lg">
			<div class="hero-content text-center">
				<div class="max-w-md">
					<svg class="mx-auto h-12 w-12 text-base-content/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<h3 class="text-lg font-medium text-base-content/70">{no_ratings}</h3>
				</div>
			</div>
		</div>
	{:else}
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body p-0">
				<div class="overflow-x-auto">
					<table class="table table-zebra w-full">
						<thead>
							<tr>
								<th class="text-base-content/70 font-medium">{provider_label}</th>
								<th class="text-base-content/70 font-medium">{average_rating_label}</th>
								<th class="text-base-content/70 font-medium">{number_ratings_label}</th>
								<th class="text-base-content/70 font-medium">{actions_label}</th>
							</tr>
						</thead>
						<tbody>
							{#each ratings as provider}
								<tr class="hover {provider.averageRating < 2 ? 'bg-error/10' : ''}">
									<td>
										<div class="flex items-center space-x-3">
											<div class="avatar">
												<div class="w-12 h-12 rounded-full overflow-hidden">
													{@html createProviderAvatar(provider.provider.firstName, provider.provider.lastName)}
												</div>
											</div>
											<div>
												<div class="font-bold text-base-content">
													{provider.provider.firstName} {provider.provider.lastName}
												</div>
												<div class="text-sm opacity-50">{provider.provider.email}</div>
											</div>
										</div>
									</td>
									<td>
										<div class="flex items-center space-x-2">
											<span class="text-lg {getRatingColor(provider.averageRating)}">
												{getRatingStars(Math.round(provider.averageRating))}
											</span>
											<span class="badge {getRatingBadge(provider.averageRating)}">
												{provider.averageRating}/5
											</span>
										</div>
									</td>
									<td>
										<span class="badge badge-outline">{provider.totalRatings} avis</span>
									</td>
									<td>
										<button
											on:click={() => toggleExpanded(provider.provider.id)}
											class="btn btn-primary btn-sm"
										>
											{expandedProvider === provider.provider.id ? hide_ratings : view_ratings}
										</button>
									</td>
								</tr>
								
								{#if expandedProvider === provider.provider.id}
									<tr>
										<td colspan="4" class="bg-base-200/50">
											<div class="p-6">
												<h4 class="text-lg font-semibold text-base-content mb-4">{rating_details}</h4>
												<div class="space-y-4">
													{#each provider.ratings as rating}
														<div class="card bg-base-100 shadow-sm border">
															<div class="card-body p-4">
																<div class="flex items-start justify-between mb-3">
																	<div class="flex items-center space-x-3">
																		<span class="text-xl {getRatingColor(rating.rating)}">
																			{getRatingStars(rating.rating)}
																		</span>
																		<span class="badge {getRatingBadge(rating.rating)}">
																			{rating.rating}/5
																		</span>
																	</div>
																	<div class="text-sm opacity-50">
																		{formatDate(rating.createdAt)}
																	</div>
																</div>
																
																{#if rating.comment}
																	<div class="bg-base-200 p-3 rounded-lg mb-3">
																		<p class="text-sm text-base-content">
																			<strong>Commentaire :</strong> "{rating.comment}"
																		</p>
																	</div>
																{:else}
																	<div class="text-sm opacity-50 italic mb-3">
																		{no_comment}
																	</div>
																{/if}
																
																<div class="flex flex-wrap gap-4 text-xs opacity-70">
																	<div>
																		<strong>{rated_by} :</strong> {rating.rater?.first_name} {rating.rater?.last_name}
																	</div>
																	{#if rating.conversation}
																		<div>
																			<strong>{service_label} :</strong> {rating.conversation.adType}
																		</div>
																	{/if}
																</div>
															</div>
														</div>
													{/each}
												</div>
											</div>
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<div class="alert alert-info mt-6">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			<div>
				<h3 class="font-bold">{legend}</h3>
				<div class="text-sm">
					<p>• {legend_low_rating}</p>
					<p>• {legend_view_details}</p>
				</div>
			</div>
		</div>
	{/if}
</div> 