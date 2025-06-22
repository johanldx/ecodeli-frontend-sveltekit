import { writable } from 'svelte/store';
import type { TourStep } from '$lib/types/tour';

// Gère si le tour est actuellement visible
export const isTourActive = writable(false);

// Gère l'étape actuelle du tour
export const tourStep = writable(0);

// Les étapes du tutoriel, définies dans le layout principal
export const tourSteps = writable<TourStep[]>([]);

/**
 * Démarre le tutoriel en réinitialisant l'état.
 */
export function startTour() {
	tourStep.set(0);
	isTourActive.set(true);
}

/**
 * Met fin au tutoriel et mémorise qu'il a été vu.
 */
export function endTour() {
	isTourActive.set(false);
	// On utilise le localStorage pour que l'utilisateur ne revoie pas le tuto à chaque visite
	localStorage.setItem('tutorialSeen', 'true');
} 