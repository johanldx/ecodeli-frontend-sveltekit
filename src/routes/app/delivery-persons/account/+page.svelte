<script lang="ts">
	import '../../../../app.css';
	import { onDestroy, onMount } from 'svelte';
	import { tabTitle } from '$lib/utils/tabTitle';
	import WalletBox from '$lib/components/WalletBox.svelte';

	onMount(() => onDestroy(tabTitle('app.delivery-persons.account.tab_title')));
</script>

<div class="ml-0 min-h-screen bg-[#FEFCF3] p-6">
	<h1 class="font-author mb-6 text-2xl text-gray-800">Mon profil livreur</h1>

	<div class="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-6 shadow-md">
		<div class="flex items-center">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
			<div>
				<h3 class="font-author text-lg text-orange-800">Modification des pièces justificatives</h3>
				<p class="text-sm text-orange-700">Pour modifier vos pièces justificatives, veuillez contacter le support Ecodeli. Notre équipe vous accompagnera dans cette démarche.</p>
			</div>
		</div>
	</div>

	<div class="max-w-2xl">
		<WalletBox profileType="delivery-persons" />
	</div>
</div>
