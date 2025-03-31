<script lang="ts">
	import { t } from '$lib/utils/t';
    import { user } from '$lib/stores/user';
    import GuardWrapper from "$lib/components/GuardWrapper.svelte";

	$: title = t('auth.space.title', { name: $user?.first_name || 'utilisateur' });

	const client_label = t('auth.space.options.client_link');
	const delivery_label = t('auth.space.options.delivery_link');
	const merchant_label = t('auth.space.options.merchant_link');
	const service_provider_label = t('auth.space.options.service_provider_link');
	const logout_label = t('auth.space.logout');
</script>

<GuardWrapper>
    <div class="text-center">

        <a href="/"><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt=""></a>
        <h1 class="mt-10 text-xl font-semibold">{$title}</h1>
    
        <div class="my-5 space-y-5">
            <a href="/auth/space/clients" class="btn btn-primary w-full">{$client_label}</a>
            <a href="/auth/space/delivery-persons" class="btn btn-primary w-full">{$delivery_label}</a>
            <a href="/auth/space/traders" class="btn btn-primary w-full">{$merchant_label}</a>
            <a href="/auth/space/providers" class="btn btn-primary w-full">{$service_provider_label}</a>
        </div>
        
        <div class="mt-6">
            <a href="/auth/logout" class="link text-sm underline">{$logout_label}</a>
        </div>
    </div>
</GuardWrapper>
