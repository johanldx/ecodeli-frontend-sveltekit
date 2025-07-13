import { notifications } from '$lib/stores/notifications';

const MIN_PRICE = 1; // Prix minimum en euros

/**
 * Valide qu'un prix est au moins égal au minimum requis
 * @param price - Le prix à valider
 * @returns true si le prix est valide, false sinon
 */
export function validatePrice(price: number): boolean {
	if (price < MIN_PRICE) {
		notifications.error(`Le prix doit être au moins de ${MIN_PRICE}€`);
		return false;
	}
	return true;
}

/**
 * Valide plusieurs prix
 * @param prices - Les prix à valider
 * @returns true si tous les prix sont valides, false sinon
 */
export function validatePrices(prices: number[]): boolean {
	for (const price of prices) {
		if (!validatePrice(price)) {
			return false;
		}
	}
	return true;
} 