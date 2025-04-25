<script lang="ts">
	import { tabTitle } from "$lib/utils/tabTitle";
	import { onDestroy, onMount, tick } from "svelte";
	import { writable, get } from 'svelte/store';
	import JsonEditor from "$lib/components/JsonEditor.svelte";
	import { fetchFromAPI } from "$lib/utils/api";
	import { notifications } from "$lib/stores/notifications";

onMount(() => onDestroy(tabTitle('admin.global')));

    let editorRef: any;
	const langs = writable<string[]>([]);
	const selectedLang = writable<string>('fr');
	const currentJson = writable<string>('{}');
	const isJsonValid = writable(true);
	const newLang = writable('');
	const showAddModal = writable(false);
	const showDeleteModal = writable(false);

	async function loadLangs() {
		const res = await fetchFromAPI<string[]>('/langs');
		langs.set(res);
	}

    function handleLangChange(event: Event) {
        const lang = (event.target as HTMLSelectElement).value;
        selectedLang.set(lang);
        loadJson(lang);
    }

    async function loadJson(lang: string) {
        try {
            const res = await fetchFromAPI(`/langs/${lang}`);
            const newJson = JSON.stringify(res, null, 2);
            currentJson.set(newJson);
            await tick();
            editorRef?.setEditorContent(newJson);
        } catch (e) {
            currentJson.set('{}');
            notifications.error('Impossible de charger la langue')
        }
    }

	function handleJsonUpdate(value: string) {
		currentJson.set(value);
		try {
			JSON.parse(value);
			isJsonValid.set(true);
		} catch {
			isJsonValid.set(false);
		}
	}

    async function saveJson() {
        if (!get(isJsonValid)) return;

        const lang = get(selectedLang);
        const data = JSON.parse(get(currentJson));

        try {
            await fetchFromAPI(`/langs/${lang}/all`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            notifications.success('Modifications enregistrées')
        } catch (error) {
            notifications.error('Une erreur est survenue lors de la sauvegarde de la langue.');
        }
    }

    async function deleteLang() {
        try {
            const lang = get(selectedLang);
            await fetchFromAPI(`/langs/${lang}`, { method: 'DELETE' });
            await loadLangs();
            const updatedLangs = get(langs);
            const fallback = updatedLangs[0] || 'fr';
            selectedLang.set(fallback);
            await loadJson(fallback);
            showDeleteModal.set(false);
            notifications.success('Langue supprimée avec succès');
        } catch (error) {
            notifications.error('Une erreur est survenue lors de la suppression de la langue.');
        }
    }

    async function createLang() {
        const lang = get(newLang).trim();
        if (!lang) return;

        try {
            await fetchFromAPI('/langs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lang, translations: {} })
            });
            newLang.set('');
            showAddModal.set(false);
            await loadLangs();
            selectedLang.set(lang);
            await loadJson(lang);
            notifications.success('Langue créée avec succès');
        } catch (error) {
            notifications.error('Une erreur est survenue lors de la création de la langue.');
        }
    }

	onMount(() => {
		onDestroy(tabTitle('admin.users'));
		loadLangs().then(() => loadJson('fr'));
	});
</script>

<!-- MODALES -->
{#if $showAddModal}
<div class="modal modal-open">
	<div class="modal-box">
		<h3 class="font-bold text-lg">Ajouter une langue</h3>
		<input type="text" class="input input-bordered w-full mt-4" placeholder="ex: es, de, it" bind:value={$newLang} />
		<div class="modal-action">
			<button class="btn btn-primary" on:click={createLang}>Créer</button>
			<button class="btn" on:click={() => showAddModal.set(false)}>Annuler</button>
		</div>
	</div>
</div>
{/if}

{#if $showDeleteModal}
<div class="modal modal-open">
	<div class="modal-box">
		<h3 class="font-bold text-lg text-error">Confirmer la suppression</h3>
		<p class="py-4">Êtes-vous sûr de vouloir supprimer la langue « {$selectedLang} » ?</p>
		<div class="modal-action">
			<button class="btn btn-error" on:click={deleteLang}>Oui, supprimer</button>
			<button class="btn" on:click={() => showDeleteModal.set(false)}>Annuler</button>
		</div>
	</div>
</div>
{/if}

<!-- PAGE -->
<div class="p-6 min-h-screen space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl mt-10 mb-5 font-medium">Langues</h1>
		<button class="btn btn-accent" on:click={() => showAddModal.set(true)}>Ajouter une langue</button>
	</div>

	<div class="flex flex-wrap gap-4 items-end">
		<div class="form-control w-full max-w-xs">
			<label class="label" for="lang-select"><span class="label-text">Choisir une langue</span></label>
			<select id="lang-select" class="select select-bordered" on:change={handleLangChange} bind:value={$selectedLang}>
				{#each $langs as lang}
					<option value={lang}>{lang}</option>
				{/each}
			</select>
		</div>

		<button class="btn btn-error" on:click={() => showDeleteModal.set(true)}>Supprimer</button>
	</div>

    <JsonEditor bind:this={editorRef} initialJson={$currentJson} on:update={e => handleJsonUpdate(e.detail)} />

	<button class="btn btn-primary mt-4" on:click={saveJson} disabled={!$isJsonValid}>
		Enregistrer
	</button>
</div>
