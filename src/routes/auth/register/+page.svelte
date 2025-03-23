<script lang="ts">
	import { t } from '$lib/utils/t';

	const register_title = t('auth.register.title');
	const register_first_name_placeholder = t('auth.register.first_name_placeholder');
	const register_last_name_placeholder = t('auth.register.last_name_placeholder');
	const register_email_placeholder = t('auth.register.email_placeholder');
	const register_password_placeholder = t('auth.register.password_placeholder');
	const register_confirm_password_placeholder = t('auth.register.confirm_password_placeholder');
	const register_button = t('auth.register.button');
	const register_login_link = t('auth.register.login_link');
</script>

<div class="text-center">
	<a href="/"><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt=""></a>
	<h1 class="mt-10 text-xl font-semibold">{$register_title}</h1>

	<form action="" class="my-5 space-y-5">
		<div class="flex flex-row gap-2">
			<input type="text" class="input flex-1" placeholder="{$register_first_name_placeholder}" />
			<input type="text" class="input flex-1" placeholder="{$register_last_name_placeholder}" />
		</div>

		<input type="email" class="input w-full" placeholder="{$register_email_placeholder}" />

		<input type="password" class="input w-full" placeholder="{$register_password_placeholder}" />
		<input type="password" class="input w-full" placeholder="{$register_confirm_password_placeholder}" />

		<input type="submit" value="{$register_button}" class="btn btn-primary w-full" />
	</form>

	<a href="/auth/forgot-password" class="">{$register_login_link}</a>
</div>
