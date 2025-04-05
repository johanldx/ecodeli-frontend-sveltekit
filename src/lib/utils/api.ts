export async function fetchFromAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const url = import.meta.env.VITE_BACKEND_API_URL + endpoint;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData?.message || 'Erreur API';
      const errorCode = response.status;  // Code HTTP (par exemple 400)
      const errorDetails = errorData?.errors || []; // Les erreurs spécifiques comme des champs invalides

      // Lancer l'erreur avec des informations supplémentaires
      const error = new Error(errorMessage);
      (error as any).status = errorCode;
      (error as any).details = errorDetails;

      throw error;
    }

    if (response.status === 204) {
      return null as unknown as T;
    }


    return await response.json() as T;
  } catch (error) {
    console.error('[fetchFromAPI] Erreur :', error);
    throw error;  // Propager l'erreur pour qu'elle puisse être capturée par le front-end
  }
}
