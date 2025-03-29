<script lang="ts">
	import { notifications } from '$lib/stores/notifications';
	import { fetchFromAPI } from '$lib/utils/api';
	import { t, tStatic } from '$lib/utils/t';

	const forgot_password_title = t('auth.forgot_password.title');
	const forgot_password_email_placeholder = t('auth.forgot_password.email_placeholder');
	const forgot_password_button = t('auth.forgot_password.button');
	const forgot_password_login_link = t('auth.forgot_password.login_link');

	let email = '';

	const handleForgotPassword = async () => {
		try {
			const data = await fetchFromAPI<{ access_token: string; refresh_token: string }>('/auth/forgot-password', {
				method: 'POST',
				body: JSON.stringify({ email }),
			});

			const message = tStatic('api_responses.auth.forgot_password.email_sent');
			notifications.success(message);

		} catch (error: any) {
			if (error.status === 404) {

				const message = tStatic('api_responses.auth.forgot_password.account_not_found');
				notifications.error(message);
			} else {
				
				const message = tStatic('api_responses.global.unknown_error');
				notifications.error(message);
			}
		}
		email = '';
	};
</script>

<div class="text-center">
	<a href="/">
		<img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt="EcoDeli" />
	</a>
	<h1 class="mt-10 text-xl font-semibold">{$forgot_password_title}</h1>

	<form on:submit|preventDefault={handleForgotPassword} class="my-5 space-y-5">
		<input type="email" id="email" bind:value={email} class="input w-full" placeholder="{$forgot_password_email_placeholder}" required/>

		<input type="submit" value="{$forgot_password_button}" class="btn btn-primary w-full" />
	</form>

	<a href="/auth/login" class="">{$forgot_password_login_link}</a>
</div>

