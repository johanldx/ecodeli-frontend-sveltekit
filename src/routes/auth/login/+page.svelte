<script lang="ts">
    import { checkAuth, login } from '$lib/utils/auth';
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

    const login_title = t('auth.login.title');
    const login_email_placeholder = t('auth.login.email_placeholder');
    const login_password_placeholder = t('auth.login.password_placeholder');
    const login_btn = t('auth.login.button');
    const login_forgot_password_link = t('auth.login.forgot_password_link');
    const login_registerL_link = t('auth.login.register_link');

    let email = '';
    let password = '';

    const handleLogin = async () => {
        try {
            const { access_token, refresh_token } = await login(email, password);
            const message = tStatic('api_responses.auth.login.login_successful');
            notifications.success(message);
            if (access_token) {
                goto('/auth/space');
            }
        } catch (error: any) {
            password = '';
            if (error.status === 401) {
                const message = tStatic('api_responses.auth.login.invalid_credentials');
                notifications.error(message);
            } else if (error.status === 403) {
                const message = tStatic('api_responses.auth.login.account_inactive');
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
    <h1 class="mt-10 text-xl font-semibold">{$login_title}</h1>

    <form on:submit|preventDefault={handleLogin} class="my-5 space-y-5">
        <input id="email" type="email" bind:value={email} placeholder="{$login_email_placeholder}" class="input" required/>
        <input id="password" type="password" bind:value={password} placeholder="{$login_password_placeholder}" class="input" required/> <br>
        <input type="submit" value="{$login_btn}" class="btn btn-primary">
    </form>

    <a href="/auth/forgot-password">{$login_forgot_password_link}</a> <br>
    <a href="/auth/register">{$login_registerL_link}</a>
</div>