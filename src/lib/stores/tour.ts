import { writable } from 'svelte/store';
import type { TourStep } from '$lib/types/tour';

export const isTourActive = writable(false);

export const tourStep = writable(0);

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