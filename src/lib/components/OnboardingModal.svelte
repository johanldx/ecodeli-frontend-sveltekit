<script lang="ts">
	import { isTourActive, tourStep, tourSteps, endTour } from '$lib/stores/tour';

	function nextStep() {
		tourStep.update((n) => {
			if (n < $tourSteps.length - 1) {
				return n + 1;
			}
			endTour();
			return n;
		});
	}

	function prevStep() {
		tourStep.update((n) => (n > 0 ? n - 1 : 0));
	}
</script>

{#if $isTourActive && $tourSteps[$tourStep]}
	<div class="modal modal-open">
		<div class="modal-box">
			<h3 class="font-bold text-lg">{$tourSteps[$tourStep].title}</h3>
			<p class="py-4">{@html $tourSteps[$tourStep].content}</p>

			<div class="flex justify-between items-center mt-4">
				<span class="text-sm text-gray-500">
					Étape {$tourStep + 1} sur {$tourSteps.length}
				</span>
				<div class="modal-action mt-0">
					{#if $tourStep > 0}
						<button class="btn btn-ghost" on:click={prevStep}>Précédent</button>
					{/if}
					<button class="btn btn-primary" on:click={nextStep}>
						{#if $tourStep === $tourSteps.length - 1}
							Terminer
						{:else}
							Suivant
						{/if}
					</button>
				</div>
			</div>
			<div class="modal-action">
				<button class="btn btn-sm btn-ghost absolute bottom-2 right-2" on:click={endTour}>Passer le tutoriel</button>
			</div>
		</div>
	</div>
{/if} 