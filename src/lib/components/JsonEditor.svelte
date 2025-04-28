<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import loader from '@monaco-editor/loader';
	import type * as monaco from 'monaco-editor';

	export let initialJson = '{}';
	const dispatch = createEventDispatcher();
	let editorContainer: HTMLDivElement;
	let editor: monaco.editor.IStandaloneCodeEditor;

	export function setEditorContent(json: string) {
		if (editor) {
			editor.setValue(json);
		}
	}

	onMount(async () => {
		const monaco = await loader.init();

		editor = monaco.editor.create(editorContainer, {
			value: initialJson,
			language: 'json',
			theme: 'vs-dark',
			automaticLayout: true,
			minimap: { enabled: true },
			fontSize: 14,
			tabSize: 2
		});

		editor.getModel()?.updateOptions({ tabSize: 2 });

		editor.onDidChangeModelContent(() => {
			const value = editor.getValue();
			dispatch('update', value);
		});
	});
</script>

<div class="border-base-300 overflow-hidden rounded border">
	<div bind:this={editorContainer} class="h-128 w-full"></div>
</div>
