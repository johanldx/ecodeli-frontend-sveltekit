<script lang="ts">
	import { goto } from '$app/navigation';
	import { notifications } from '$lib/stores/notifications';
	import { fetchFromAPI } from '$lib/utils/api';
	import { tStatic } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onMount, onDestroy } from 'svelte';

	let resetPasswordToken = '';
	let password = '';

	if (typeof window !== 'undefined') {
		const urlParams = new URLSearchParams(window.location.search);
		resetPasswordToken = urlParams.get('token') || '';
	}

	const handleResetPassword = async () => {
		try {
			const data = await fetchFromAPI<{ access_token: string; refresh_token: string }>(
				'/auth/reset-password',
				{
					method: 'POST',
					body: JSON.stringify({ resetPasswordToken, password })
				}
			);

			const message = tStatic('api_responses.auth.reset_password.password_updated');
			notifications.success(message);
			goto('/auth/login');
		} catch (error: any) {
			if (error.status === 400) {
				const message = tStatic('api_responses.auth.reset_password.invalid_token');
				notifications.error(message);
			} else {
				const message = tStatic('api_responses.auth.global.unknown_error');
				notifications.error(message);
			}
		}
		resetPasswordToken = '';
		password = '';
	};

	onMount(() => {
		onDestroy(tabTitle('auth.reset_password.title'));
	});
</script>

<div class="text-center">
	<a href="/">
		<img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt="EcoDeli" />
	</a>
	<h1 class="mt-10 text-xl font-semibold">Réinitialiser le mot de passe</h1>

	<form on:submit|preventDefault={handleResetPassword} class="my-5 space-y-5">
		<input
			type="text"
			id="token"
			name="token"
			class="input w-full"
			placeholder="Code"
			bind:value={resetPasswordToken}
			required
		/>
		<input
			type="password"
			id="password"
			name="password"
			class="input w-full"
			placeholder="Nouveau mot de passe"
			bind:value={password}
			required
		/>

		<input type="submit" value="Changer" class="btn btn-primary w-full" />
	</form>

	<a href="/auth/login" class="">Connexion</a>
</div>
