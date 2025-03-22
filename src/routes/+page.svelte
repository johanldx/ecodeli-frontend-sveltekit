<script lang="ts">
    import { t } from '$lib/utils/t';

    const hero_section_title = t('landing.index.hero_section.title');
    const hero_section_subtitle = t('landing.index.hero_section.subtitle');
    const hero_section_cta_btn = t('landing.index.hero_section.cta_button');

    const features_section_title = t('landing.index.features_section.title');
    const features_section_collaborative_delivery_title = t('landing.index.features_section.features.collaborative_delivery.title');
    const features_section_collaborative_delivery_description = t('landing.index.features_section.features.collaborative_delivery.description');
    const features_section_personal_services_title = t('landing.index.features_section.features.personal_services.title');
    const features_section_personal_services_description = t('landing.index.features_section.features.personal_services.description');
    const features_section_product_repatriation_title = t('landing.index.features_section.features.product_repatriation.title');
    const features_section_product_repatriation_description = t('landing.index.features_section.features.product_repatriation.description');
    const features_section_chariot_rental_title = t('landing.index.features_section.features.chariot_rental.title');
    const features_section_chariot_rental_description = t('landing.index.features_section.features.chariot_rental.description');

    const faq_section_title = t('landing.index.faq_section.title');


</script>

<div class="mt-10 color-dark-green text-center">
    <h1 class="text-center m-auto font-semibold text-3xl md:text-7xl md:w-2/3 color-dark-green">{$hero_section_title}</h1>
    <p class="text-center m-auto mt-10 text-md md:w-3/4 text-nexus-blue">{$hero_section_subtitle}</p>
    <a href="login" class="btn btn-primary font-normal mt-10">{$hero_section_cta_btn}</a>
</div>

<div class="mt-20 bg-neutral text-base-200 w-full">
    <div class="container mx-auto flex flex-col md:flex-row items-start justify-between gap-10 py-20">
        <div class="w-full md:w-1/2 flex flex-col items-center text-center md:sticky top-10">
            <h2 class="text-neutral-100 text-4xl font-medium md:w-2/3">{$features_section_title}</h2>
            <img class="w-75 mt-10" src="images/illustrations/package.webp" alt="">
        </div>
        <div class="w-full md:w-1/2 flex flex-col items-start text-left">
            <div>
                <h3 class="text-neutral-100 text-2xl flex items-center gap-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-15 h-15">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>   
                    {$features_section_collaborative_delivery_title}
                </h3>
                <p class="text-neutral-100 mt-2">{$features_section_collaborative_delivery_description}</p>
                <hr class="border-emerald-900 my-5 w-full">
            </div>
            <div>
                <h3 class="text-neutral-100 text-2xl flex items-center gap-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-15 h-15">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>											
                    {$features_section_personal_services_title}
                </h3>
                <p class="text-neutral-100 mt-2">{$features_section_personal_services_description}</p>
                <hr class="border-emerald-900 my-5 w-full">
            </div>
            <div>
                <h3 class="text-neutral-100 text-2xl flex items-center gap-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-15 h-15">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m20.893 13.393-1.135-1.135a2.252 2.252 0 0 1-.421-.585l-1.08-2.16a.414.414 0 0 0-.663-.107.827.827 0 0 1-.812.21l-1.273-.363a.89.89 0 0 0-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 0 1-1.81 1.025 1.055 1.055 0 0 1-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 0 1-1.383-2.46l.007-.042a2.25 2.25 0 0 1 .29-.787l.09-.15a2.25 2.25 0 0 1 2.37-1.048l1.178.236a1.125 1.125 0 0 0 1.302-.795l.208-.73a1.125 1.125 0 0 0-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 0 1-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 0 1-1.458-1.137l1.411-2.353a2.25 2.25 0 0 0 .286-.76m11.928 9.869A9 9 0 0 0 8.965 3.525m11.928 9.868A9 9 0 1 1 8.965 3.525" />
                    </svg>										
                    {$features_section_product_repatriation_title}
                </h3>
                <p class="text-neutral-100 mt-2">{$features_section_product_repatriation_description}</p>
                <hr class="border-emerald-900 my-5 w-full">
            </div>
            <div>
                <h3 class="text-neutral-100 text-2xl flex items-center gap-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-15 h-15">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>									
                    {$features_section_chariot_rental_title}
                </h3>
                <p class="text-neutral-100 mt-2">{$features_section_chariot_rental_description}</p>
            </div>
        </div>
    </div>
</div>

<div class="pt-20 bg-neutral text-base-200 w-full">
    <div class="container mx-auto px-30">
        <h2 class="text-center mb-10 text-4xl font-medium">{$faq_section_title}</h2>

        <div class="collapse collapse-arrow">
            <input type="radio" name="my-accordion-2" checked />
            <div class="collapse-title font-medium">Placeholder</div>
            <div class="collapse-content">Placeholder</div>
            <hr class="border-emerald-900 my-5 w-full">
        </div>
        <div class="collapse collapse-arrow">
            <input type="radio" name="my-accordion-2" />
            <div class="collapse-title font-medium">Placeholder</div>
            <div class="collapse-content">Placeholder</div>
            <hr class="border-emerald-900 my-5 w-full">
        </div>
    </div>
</div>