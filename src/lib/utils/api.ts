export async function fetchFromAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	try {
		const url = import.meta.env.VITE_BACKEND_API_URL + endpoint;
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			},
			...options
		});

		if (!response.ok) {
			// Essayer de parser le JSON d'erreur, mais gérer le cas où il n'y en a pas
			let errorData;
			try {
				errorData = await response.json();
			} catch {
				errorData = { message: 'Erreur API' };
			}
			
			const errorMessage = errorData?.message || 'Erreur API';
			const errorCode = response.status;
			const errorDetails = errorData?.errors || [];

			const error = new Error(errorMessage);
			(error as any).status = errorCode;
			(error as any).details = errorDetails;

			throw error;
		}

		// Gérer les réponses vides
		if (response.status === 204 || response.headers.get('content-length') === '0') {
			return null as unknown as T;
		}

		// Vérifier si la réponse a du contenu avant de parser le JSON
		const text = await response.text();
		if (!text || text.trim() === '') {
			return null as unknown as T;
		}

		try {
			return JSON.parse(text) as T;
		} catch (parseError) {
			console.error('[fetchFromAPI] Erreur de parsing JSON:', parseError, 'Contenu:', text);
			throw new Error('Réponse invalide du serveur');
		}
	} catch (error) {
		console.error('[fetchFromAPI] Erreur :', error);
		throw error;
	}
}
