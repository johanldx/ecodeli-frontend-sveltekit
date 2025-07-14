import { notifications } from '$lib/stores/notifications';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2Mo en octets


export function validateFileSize(file: File): boolean {
	if (file.size > MAX_FILE_SIZE) {
		notifications.error(`Le fichier "${file.name}" est trop volumineux. Taille maximum : 2Mo`);
		return false;
	}
	return true;
}

export function validateFilesSize(files: File[]): boolean {
	for (const file of files) {
		if (!validateFileSize(file)) {
			return false;
		}
	}
	return true;
}

export function filterValidFiles(files: File[]): File[] {
	return files.filter(file => file.size <= MAX_FILE_SIZE);
} 