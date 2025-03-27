<script lang="ts">
	import { t } from '$lib/utils/t';
    import GuardWrapper from "$lib/components/GuardWrapper.svelte";

	const title = t('auth.account.title');

	// Profil
	const first_name_placeholder = t('auth.account.profile.first_name_placeholder');
	const last_name_placeholder = t('auth.account.profile.last_name_placeholder');
	const email_placeholder = t('auth.account.profile.email_placeholder');
	const save_profile_button = t('auth.account.profile.save_button');

	// Mot de passe
	const old_password_placeholder = t('auth.account.password.old_password_placeholder');
	const new_password_placeholder = t('auth.account.password.new_password_placeholder');
	const save_password_button = t('auth.account.password.save_button');

	// Actions
	const delete_account = t('auth.account.actions.delete_account');
	const personal_info = t('auth.account.actions.personal_info');
	const return_to_app_link = t('auth.account.actions.return_to_app_link');
</script>

<GuardWrapper>
    <div class="text-center">

        <a href="/"><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt=""></a>
        <h1 class="mt-10 text-xl font-semibold">{$title}</h1>
    
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left my-5">
            <form class="space-y-4">
                <div class="flex gap-2">
                    <input type="text" placeholder={$first_name_placeholder} class="input input-bordered w-1/2" />
                    <input type="text" placeholder={$last_name_placeholder} class="input input-bordered w-1/2" />
                </div>
                <input type="email" placeholder={$email_placeholder} class="input input-bordered w-full" />
                <button type="submit" class="btn btn-primary w-full">{$save_profile_button}</button>
            </form>
    
            <form class="space-y-4">
                <input type="password" placeholder={$old_password_placeholder} class="input input-bordered w-full" />
                <input type="password" placeholder={$new_password_placeholder} class="input input-bordered w-full" />
                <button type="submit" class="btn btn-primary w-full">{$save_password_button}</button>
            </form>
    
            <div class="space-y-4">
                <a href="/account/delete" class="btn btn-error w-full">{$delete_account}</a>
                <a href="/account/info" class="btn btn-neutral w-full">{$personal_info}</a>
            </div>
        </div>
    
        
        <div class="mt-6">
            <a href="/logout">{$return_to_app_link}</a>
        </div>
    </div>
</GuardWrapper>
