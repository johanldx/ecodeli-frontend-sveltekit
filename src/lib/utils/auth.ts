import { fetchFromAPI } from '$lib/utils/api';

// Connexion
export async function login(email: string, password: string) {
  const data = await fetchFromAPI<{ access_token: string; refresh_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);

  return data;
}

// Inscription
export async function register(email: string, password: string, first_name: string, last_name: string) {
  const data = await fetchFromAPI<{ access_token: string; refresh_token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, first_name, last_name }),
  });

  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);

  return data;
}

// Rafraîchir le token
export async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token available.');

  const data = await fetchFromAPI<{ access_token: string }>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  localStorage.setItem('access_token', data.access_token);
  return data.access_token;
}

// Mot de passe oublié
export async function forgotPassword(email: string) {
  return await fetchFromAPI<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// Réinitialisation du mot de passe
export async function resetPassword(resetPasswordToken: string, newPassword: string) {
  return await fetchFromAPI<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ resetPasswordToken, password: newPassword }),
  });
}
