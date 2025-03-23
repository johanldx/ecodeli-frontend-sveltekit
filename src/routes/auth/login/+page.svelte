<script lang="ts">
    import { t } from '$lib/utils/t';

    const login_title = t('auth.login.title');
    const login_email_placeholder = t('auth.login.email_placeholder');
    const login_password_placeholder = t('auth.login.password_placeholder');
    const login_btn = t('auth.login.button');
    const login_forgot_password_link = t('auth.login.forgot_password_link');
    const login_registerL_link = t('auth.login.register_link');
</script>

<div class="text-center">
    <a href="/"><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt=""></a>
    <h1 class="mt-10 text-xl font-semibold">{$login_title}</h1>

    <form action="" class="my-5 space-y-5">
        <input type="email" placeholder="{$login_email_placeholder}" class="input" />
        <input type="password" placeholder="{$login_password_placeholder}" class="input" /> <br>
        <input type="submit" value="{$login_btn}" class="btn btn-primary">
    </form>

    <a href="/auth/forgot-password">{$login_forgot_password_link}</a> <br>
    <a href="/auth/register">{$login_registerL_link}</a>
</div>