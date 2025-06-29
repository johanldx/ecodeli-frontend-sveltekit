<script lang="ts">
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { onDestroy, onMount } from 'svelte';

	onMount(() => onDestroy(tabTitle('landing.index.tab_title')));

	const hero_section_title = t('landing.index.hero_section.title');
	const hero_section_subtitle = t('landing.index.hero_section.subtitle');
	const hero_section_cta_btn = t('landing.index.hero_section.cta_button');

	const features_section_title = t('landing.index.features_section.title');
	const features_section_collaborative_delivery_title = t(
		'landing.index.features_section.features.collaborative_delivery.title'
	);
	const features_section_collaborative_delivery_description = t(
		'landing.index.features_section.features.collaborative_delivery.description'
	);
	const features_section_personal_services_title = t(
		'landing.index.features_section.features.personal_services.title'
	);
	const features_section_personal_services_description = t(
		'landing.index.features_section.features.personal_services.description'
	);
	const features_section_product_repatriation_title = t(
		'landing.index.features_section.features.product_repatriation.title'
	);
	const features_section_product_repatriation_description = t(
		'landing.index.features_section.features.product_repatriation.description'
	);
	const features_section_chariot_rental_title = t(
		'landing.index.features_section.features.chariot_rental.title'
	);
	const features_section_chariot_rental_description = t(
		'landing.index.features_section.features.chariot_rental.description'
	);

	const faq_section_title = t('landing.index.faq_section.title');
	const faq_section_what_is_ecodeli_question = t(
		'landing.index.faq_section.questions.what_is_ecodeli.question'
	);
	const faq_section_what_is_ecodeli_answer = t(
		'landing.index.faq_section.questions.what_is_ecodeli.answer'
	);
	const faq_section_become_delivery_person_question = t(
		'landing.index.faq_section.questions.become_delivery_person.question'
	);
	const faq_section_become_delivery_person_answer = t(
		'landing.index.faq_section.questions.become_delivery_person.answer'
	);
	const faq_section_delivery_security_question = t(
		'landing.index.faq_section.questions.delivery_security.question'
	);
	const faq_section_delivery_security_answer = t(
		'landing.index.faq_section.questions.delivery_security.answer'
	);
</script>

<div class="color-dark-green mt-10 text-center">
	<h1 class="color-dark-green m-auto text-center text-3xl font-semibold md:w-2/3 md:text-7xl">
		{$hero_section_title}
	</h1>
	<p class="text-md text-nexus-blue m-auto mt-10 text-center md:w-3/4">{$hero_section_subtitle}</p>
	<a href="/app/clients" class="btn btn-primary mt-10 font-normal">{$hero_section_cta_btn}</a>
</div>

<div class="bg-neutral text-base-200 mt-20 w-full">
	<div class="container mx-auto flex flex-col items-start justify-between gap-10 px-4 py-20 md:flex-row md:px-8">
		<div class="flex w-full flex-col items-center text-center md:sticky md:top-10 md:w-1/2">
			<h2 class="text-3xl font-medium text-neutral-100 md:text-4xl md:w-2/3">{$features_section_title}</h2>
			<img class="mt-10 w-full max-w-md" src="images/illustrations/package.webp" alt="" />
		</div>
		<div class="flex w-full flex-col items-start gap-8 text-left md:w-1/2">
			<div>
				<h3 class="flex items-center gap-x-2 text-xl text-neutral-100 md:text-2xl">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1"
						stroke="currentColor"
						class="h-8 w-8 md:h-12 md:w-12"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
						/>
					</svg>
					{$features_section_collaborative_delivery_title}
				</h3>
				<p class="mt-2 text-sm text-neutral-100 md:text-base">{$features_section_collaborative_delivery_description}</p>
				<hr class="my-5 w-full border-emerald-900" />
			</div>
			<div>
				<h3 class="flex items-center gap-x-2 text-xl text-neutral-100 md:text-2xl">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1"
						stroke="currentColor"
						class="h-8 w-8 md:h-12 md:w-12"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
						/>
					</svg>
					{$features_section_personal_services_title}
				</h3>
				<p class="mt-2 text-sm text-neutral-100 md:text-base">{$features_section_personal_services_description}</p>
				<hr class="my-5 w-full border-emerald-900" />
			</div>
			<div>
				<h3 class="flex items-center gap-x-2 text-xl text-neutral-100 md:text-2xl">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1"
						stroke="currentColor"
						class="h-8 w-8 md:h-12 md:w-12"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m20.893 13.393-1.135-1.135a2.252 2.252 0 0 1-.421-.585l-1.08-2.16a.414.414 0 0 0-.663-.107.827.827 0 0 1-.812.21l-1.273-.363a.89.89 0 0 0-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 0 1-1.81 1.025 1.055 1.055 0 0 1-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 0 1-1.383-2.46l.007-.042a2.25 2.25 0 0 1 .29-.787l.09-.15a2.25 2.25 0 0 1 2.37-1.048l1.178.236a1.125 1.125 0 0 0 1.302-.795l.208-.73a1.125 1.125 0 0 0-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 0 1-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 0 1-1.458-1.137l1.411-2.353a2.25 2.25 0 0 0 .286-.76m11.928 9.869A9 9 0 0 0 8.965 3.525m11.928 9.868A9 9 0 1 1 8.965 3.525"
						/>
					</svg>
					{$features_section_product_repatriation_title}
				</h3>
				<p class="mt-2 text-sm text-neutral-100 md:text-base">{$features_section_product_repatriation_description}</p>
				<hr class="my-5 w-full border-emerald-900" />
			</div>
			<div>
				<h3 class="flex items-center gap-x-2 text-xl text-neutral-100 md:text-2xl">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1"
						stroke="currentColor"
						class="h-8 w-8 md:h-12 md:w-12"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
						/>
					</svg>
					{$features_section_chariot_rental_title}
				</h3>
				<p class="mt-2 text-sm text-neutral-100 md:text-base">{$features_section_chariot_rental_description}</p>
			</div>
		</div>
	</div>
</div>

<div class="bg-neutral text-base-200 w-full pt-20">
	<div class="container mx-auto px-4 md:px-8">
		<h2 class="mb-10 text-center text-3xl font-medium md:text-4xl">{$faq_section_title}</h2>

		<div class="collapse-arrow collapse mb-4">
			<input type="radio" name="my-accordion-2" checked />
			<div class="collapse-title text-base font-medium md:text-lg">{$faq_section_what_is_ecodeli_question}</div>
			<div class="collapse-content text-sm md:text-base">{$faq_section_what_is_ecodeli_answer}</div>
			<hr class="my-5 w-full border-emerald-900" />
		</div>
		<div class="collapse-arrow collapse mb-4">
			<input type="radio" name="my-accordion-2" />
			<div class="collapse-title text-base font-medium md:text-lg">{$faq_section_become_delivery_person_question}</div>
			<div class="collapse-content text-sm md:text-base">{$faq_section_become_delivery_person_answer}</div>
			<hr class="my-5 w-full border-emerald-900" />
		</div>
		<div class="collapse-arrow collapse">
			<input type="radio" name="my-accordion-2" />
			<div class="collapse-title text-base font-medium md:text-lg">{$faq_section_delivery_security_question}</div>
			<div class="collapse-content text-sm md:text-base">{$faq_section_delivery_security_answer}</div>
			<hr class=" w-full border-emerald-900" />
		</div>
	</div>
</div>
