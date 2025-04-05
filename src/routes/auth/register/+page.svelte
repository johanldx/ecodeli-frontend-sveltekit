<script lang="ts">
	import { checkAuth, register } from '$lib/utils/auth';
	import { notifications } from '$lib/stores/notifications';
	import { t, tStatic } from '$lib/utils/t';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(async () => {
		const isLoggedIn = await checkAuth();

		if (isLoggedIn) {
            const message = tStatic('api_responses.auth.global.already_logged_in');
            notifications.success(message);
			goto('/auth/space');
		}
	});

	const register_title = t('auth.register.title');
	const register_first_name_placeholder = t('auth.register.first_name_placeholder');
	const register_last_name_placeholder = t('auth.register.last_name_placeholder');
	const register_email_placeholder = t('auth.register.email_placeholder');
	const register_password_placeholder = t('auth.register.password_placeholder');
	const register_button = t('auth.register.button');
	const register_login_link = t('auth.register.login_link');

	let email = '';
	let password = '';
	let first_name = '';
	let last_name = '';

	const handleRegister = async () => {
		try {
			const { access_token, refresh_token } = await register(email, password, first_name, last_name);

			const message = tStatic('api_responses.auth.register.register_successful');
			notifications.success(message);
			goto('/auth/space');
		} catch (error: any) {
			if (error.status === 400) {
				const message = tStatic('api_responses.auth.register.bad_request');
				notifications.error(message);
			} else if (error.status === 409) {
				const message = tStatic('api_responses.auth.register.user_already_exists');
				notifications.error(message);
			} else {
				
				const message = tStatic('api_responses.auth.global.unknown_error');
				notifications.error(message);
			}
		}
	};

</script>

<div class="text-center">
	<a href="/"><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt=""></a>
	<h1 class="mt-10 text-xl font-semibold">{$register_title}</h1>

	<form on:submit|preventDefault={handleRegister} class="my-5 space-y-5">
		<div class="flex flex-row gap-2">
			<input type="text" id="first_name" bind:value={first_name} class="input flex-1" placeholder="{$register_first_name_placeholder}" required/>
			<input type="text" id="last_name" bind:value={last_name} class="input flex-1" placeholder="{$register_last_name_placeholder}" required/>
		</div>

		<input type="email" id="email" bind:value={email} class="input w-full" placeholder="{$register_email_placeholder}" required/>

		<input type="password" id="password" bind:value={password} class="input w-full" placeholder="{$register_password_placeholder}" required/>

		<input type="submit" value="{$register_button}" class="btn btn-primary w-full" />
	</form>

	<a href="/auth/login" class="">{$register_login_link}</a>
</div>
