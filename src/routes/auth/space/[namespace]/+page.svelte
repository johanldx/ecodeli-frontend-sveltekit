<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import { notifications } from '$lib/stores/notifications';
	import { t, tStatic } from '$lib/utils/t';

	const VALID_NAMESPACES = ['alpha', 'beta', 'gamma', 'delta'];

	let namespace = '';
	let status: 'non-validé' | 'en-attente' | 'validé' | null = null;
	let loading = true;

	// Champs dynamiques
	let formData: Record<string, string> = {};

	onMount(async () => {
		namespace = $page.params.namespace;

		if (!VALID_NAMESPACES.includes(namespace)) {
			goto('/unauthorized');
			return;
		}

		try {
			status = "non-validé";

			if (status === 'validé') {
				goto(`/app/${namespace}`);
				return;
			}
		} catch (error) {
			console.error(error);
			notifications.error(tStatic('api_responses.auth.global.unknown_error'));
		} finally {
			loading = false;
		}
	});

	const handleSubmit = async () => {
		try {
			const res = await fetch(`/api/namespace/${namespace}/request-access`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (!res.ok) throw new Error('Échec de la demande');

			notifications.success(tStatic('api_responses.namespace.request_success'));
			goto(`/auth/space/${namespace}`);
		} catch (err) {
			notifications.error(tStatic('api_responses.namespace.request_error'));
		}
	};
</script>

<GuardWrapper>
  {#if loading}
	<div class="flex items-center justify-center min-h-screen">
		<span class="loading loading-bars loading-lg text-primary"></span>
	</div>

  {:else if status === 'non-validé'}
    <div class="text-center p-4 max-w-lg mx-auto">
      <img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto mb-4" alt="">
      <h1 class="text-2xl font-bold mb-6">{namespace} – {t(`namespace.${namespace}.title`)}</h1>

      <form class="space-y-4" on:submit|preventDefault={handleSubmit}>
        {#if namespace === 'alpha'}
          <input type="text" class="input w-full" placeholder="Nom complet" bind:value={formData.fullname} required />
          <input type="email" class="input w-full" placeholder="Email pro" bind:value={formData.email} required />

        {:else if namespace === 'beta'}
          <input type="text" class="input w-full" placeholder="Entreprise" bind:value={formData.company} required />
          <input type="url" class="input w-full" placeholder="Site web" bind:value={formData.website} />

        {:else if namespace === 'gamma'}
          <input type="text" class="input w-full" placeholder="Pseudo Discord" bind:value={formData.discord} required />
          <select class="select w-full" bind:value={formData.role}>
            <option disabled selected>Choisissez un rôle</option>
            <option value="moderateur">Modérateur</option>
            <option value="partenaire">Partenaire</option>
          </select>

        {:else if namespace === 'delta'}
          <textarea class="textarea w-full" placeholder="Décrivez votre projet" bind:value={formData.project} required></textarea>
          <input type="text" class="input w-full" placeholder="Contact principal" bind:value={formData.contact} required />
        {/if}

        <input type="submit" class="btn btn-primary w-full" value={t('namespace.submit')} />
      </form>
    </div>

  {:else if status === 'en-attente'}
    <div class="text-center p-4 max-w-lg mx-auto">
      <img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto mb-4" alt="">
      <h1 class="text-2xl font-bold mb-4">{t(`namespace.${namespace}.waiting_title`)}</h1>
      <p>{t(`namespace.${namespace}.waiting_message`)}</p>
    </div>
  {/if}
</GuardWrapper>