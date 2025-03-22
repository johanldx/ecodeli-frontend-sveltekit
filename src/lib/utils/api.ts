export async function fetchFromAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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
      throw new Error(`Erreur API : ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error('[fetchFromAPI] Erreur :', error);
    throw error;
  }
}
