<script lang="ts">
    import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';
	import { fetchFromAPI } from '$lib/utils/api';
    import { notifications } from '$lib/stores/notifications';

	onMount(() => onDestroy(tabTitle('track')));

	let email = '';
	let ref = '';
	let trackingType: 'A' | 'B' | 'C' | null = null;
	let trackingData: { ref: string } | null = null;

	const form_title = t('track.form.title');
	const form_email_placeholder = t('track.form.email_placeholder');
	const form_ref_placeholder = t('track.form.ref_placeholder');
	const form_button = t('track.form.button');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		trackingType = null;
		trackingData = null;

		try {
			const response = await fetchFromAPI<{ type: 'A' | 'B' | 'C'; data: { ref: string } }>('/track', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, ref })
			});

			trackingType = response.type;
			trackingData = response.data;

			notifications.success('Suivi récupéré avec succès.');
		} catch (err) {
			console.error(err);
			notifications.error('Erreur lors du suivi. Veuillez réessayer.');
		}
	}

	function refreshPage() {
		location.reload();
	}
</script>

<div class="text-center">
    <a href="/"><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt=""></a>

    <h1 class="mt-10 text-xl font-semibold">
        {#if trackingData}
            Suivi {trackingData.ref}
        {:else}
            {$form_title}
        {/if}
    </h1>

    {#if !trackingType}
        <form class="my-5 space-y-5" on:submit|preventDefault={handleSubmit}>
            <input id="email" type="email" bind:value={email} placeholder="{$form_email_placeholder}" class="input" required />
            <input id="ref" type="text" bind:value={ref} placeholder="{$form_ref_placeholder}" class="input" required />
            <br />
            <input type="submit" value="{$form_button}" class="btn btn-primary" />
        </form>
    {/if}

    {#if trackingType === 'A'}
        <div class="my-10">
            <!-- Contenu pour le type A -->
            <p>Contenu A</p>
        </div>
    {:else if trackingType === 'B'}
        <div class="my-10">
            <!-- Contenu pour le type B -->
            <p>Contenu B</p>
        </div>
    {:else if trackingType === 'C'}
        <div class="my-10">
            <!-- Contenu pour le type C -->
            <p>Contenu C</p>
        </div>
    {/if}

    {#if trackingType}
        <button on:click={refreshPage}>Retour</button>
    {:else}
        <a href="/auth/space">Retour</a>
    {/if}
</div>
