<script lang="ts">
	import { t } from '$lib/utils/t';

	const title = t('auth.profile_choice.title', { name: 'John' });

	const client_label = t('auth.profile_choice.options.client_link');
	const delivery_label = t('auth.profile_choice.options.delivery_link');
	const merchant_label = t('auth.profile_choice.options.merchant_link');
	const service_provider_label = t('auth.profile_choice.options.service_provider_link');
	const logout_label = t('auth.profile_choice.logout');
</script>

<div class="text-center">

    <a href="/"><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt=""></a>
	<h1 class="mt-10 text-xl font-semibold">{$title}</h1>

    <div class="my-5 space-y-5">
        <a href="/client" class="btn btn-primary w-full">{$client_label}</a>
        <a href="/delivery" class="btn btn-primary w-full">{$delivery_label}</a>
        <a href="/merchant" class="btn btn-primary w-full">{$merchant_label}</a>
        <a href="/service-provider" class="btn btn-primary w-full">{$service_provider_label}</a>
    </div>
    
    <div class="mt-6">
        <a href="/logout" class="link text-sm underline">{$logout_label}</a>
    </div>
</div>
