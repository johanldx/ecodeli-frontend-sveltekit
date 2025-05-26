<script lang="ts">
	import '../../../../app.css';
	import { onDestroy, onMount } from 'svelte';
	import { tabTitle } from '$lib/utils/tabTitle';
	import WalletBox from '$lib/components/WalletBox.svelte';

	onMount(() => onDestroy(tabTitle('app.delivery.account')));
</script>

<div class="ml-0 min-h-screen max-w-2xl bg-[#FEFCF3] p-6">
	<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
		<p class="text-gray-600">
			Pour gérer vos pièces justificatives, merci de contacter le support Ecodeli.
		</p>
	</div>
	<WalletBox profileType="delivery-persons" />
</div>
