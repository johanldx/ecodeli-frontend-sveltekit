import { notifications } from '$lib/stores/notifications';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2Mo en octets

/**
 * Valide la taille d'un fichier
 * @param file - Le fichier à valider
 * @returns true si le fichier est valide, false sinon
 */
export function validateFileSize(file: File): boolean {
	if (file.size > MAX_FILE_SIZE) {
		notifications.error(`Le fichier "${file.name}" est trop volumineux. Taille maximum : 2Mo`);
		return false;
	}
	return true;
}

/**
 * Valide la taille de plusieurs fichiers
 * @param files - Les fichiers à valider
 * @returns true si tous les fichiers sont valides, false sinon
 */
export function validateFilesSize(files: File[]): boolean {
	for (const file of files) {
		if (!validateFileSize(file)) {
			return false;
		}
	}
	return true;
}

/**
 * Filtre les fichiers selon leur taille et retourne seulement ceux qui sont valides
 * @param files - Les fichiers à filtrer
 * @returns Les fichiers valides
 */
export function filterValidFiles(files: File[]): File[] {
	return files.filter(file => file.size <= MAX_FILE_SIZE);
} 