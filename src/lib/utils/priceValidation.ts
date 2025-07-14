import { notifications } from '$lib/stores/notifications';

const MIN_PRICE = 1; // Prix minimum en euros

export function validatePrice(price: number): boolean {
	if (price < MIN_PRICE) {
		notifications.error(`Le prix doit être au moins de ${MIN_PRICE}€`);
		return false;
	}
	return true;
}

export function validatePrices(prices: number[]): boolean {
	for (const price of prices) {
		if (!validatePrice(price)) {
			return false;
		}
	}
	return true;
} 