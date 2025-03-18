export async function fetchFromAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_API_URL + endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });
  
      if (!response.ok) {
        throw new Error(`Erreur API : ${response.statusText}`);
      }
  
      return await response.json() as T;
    } catch (error) {
      console.error("Erreur lors de l'appel API :", error);
      throw error;
    }
  }
  