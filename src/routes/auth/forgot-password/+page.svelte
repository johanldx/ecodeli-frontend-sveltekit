<script lang="ts">
	import { t } from '$lib/utils/t';

	const forgot_password_title = t('auth.forgot_password.title');
	const forgot_password_email_placeholder = t('auth.forgot_password.email_placeholder');
	const forgot_password_button = t('auth.forgot_password.button');
	const forgot_password_login_link = t('auth.forgot_password.login_link');
</script>

<div class="text-center">
	<a href="/">
		<img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt="EcoDeli" />
	</a>
	<h1 class="mt-10 text-xl font-semibold">{$forgot_password_title}</h1>

	<form action="" class="my-5 space-y-5">
		<input
			type="email"
			class="input w-full"
			placeholder="{$forgot_password_email_placeholder}"
		/>

		<input type="submit" value="{$forgot_password_button}" class="btn btn-primary w-full" />
	</form>

	<a href="/auth/login" class="">{$forgot_password_login_link}</a>
</div>
