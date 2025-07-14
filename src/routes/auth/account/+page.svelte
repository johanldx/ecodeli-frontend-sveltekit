<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { t, tStatic } from '$lib/utils/t';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import { user, type User } from '$lib/stores/user';
	import { fetchFromAPI } from '$lib/utils/api';
	import { accessToken } from '$lib/stores/token';
	import { get } from 'svelte/store';
	import { notifications } from '$lib/stores/notifications';
	import { tabTitle } from '$lib/utils/tabTitle';

	const title = t('auth.account.title');
	const first_name_placeholder = t('auth.account.profile.first_name_placeholder');
	const last_name_placeholder = t('auth.account.profile.last_name_placeholder');
	const email_placeholder = t('auth.account.profile.email_placeholder');
	const save_profile_button = t('auth.account.profile.save_button');
	const old_password_placeholder = t('auth.account.password.old_password_placeholder');
	const new_password_placeholder = t('auth.account.password.new_password_placeholder');
	const save_password_button = t('auth.account.password.save_button');
	const delete_account = t('auth.account.actions.delete_account');
	const personal_info = t('auth.account.actions.personal_info');
	const return_to_app_link = t('auth.account.actions.return_to_app_link');
	const support_rgpd = t('auth.account.support_rgpd');

	let first_name: string = '';
	let last_name: string = '';
	let email: string = '';
	let oldPassword: string = '';
	let newPassword: string = '';

	onMount(async () => {
		try {
			const userData = await fetchFromAPI<User>('/auth/me', {
				method: 'GET',
				headers: { Authorization: `Bearer ${get(accessToken)}` }
			});
			user.set(userData);
			first_name = userData.first_name;
			last_name = userData.last_name;
			email = userData.email;
		} catch (error) {
			console.error('Erreur lors de la récupération du profil utilisateur', error);
		}
		onDestroy(tabTitle('auth.account.tab_title'));
	});

	async function handleProfileUpdate(e: Event) {
		e.preventDefault();
		try {
			const updatedUser = await fetchFromAPI<User>('/auth/me', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				},
				body: JSON.stringify({
					first_name,
					last_name,
					email
				})
			});
			user.set(updatedUser);
			const message = tStatic('api_responses.auth.account.account_updated');
			notifications.success(message);
		} catch (error: any) {
			if (error.status === 400) {
				const message = tStatic('api_responses.auth.global.fields_missing_invalid');
				notifications.error(message);
			} else if (error.status === 409) {
				const message = tStatic('api_responses.auth.account.user_already_exists');
				notifications.error(message);
			} else {
				const message = tStatic('api_responses.auth.global.unknown_error');
				notifications.error(message);
			}
		}
	}

	async function handlePasswordUpdate(e: Event) {
		e.preventDefault();
		try {
			await fetchFromAPI<any>('/auth/change-password', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${get(accessToken)}`
				},
				body: JSON.stringify({
					oldPassword,
					newPassword
				})
			});
			const message = tStatic('api_responses.auth.account.password_updated');
			notifications.success(message);
		} catch (error: any) {
			if (error.status === 400) {
				const message = tStatic('api_responses.auth.account.incorrect_new_password');
				notifications.error(message);
			} else if (error.status === 401) {
				const message = tStatic('api_responses.auth.account.incorrect_old_password');
				notifications.error(message);
			} else if (error.status === 404) {
				const message = tStatic('api_responses.auth.global.user_not_found');
				notifications.error(message);
			} else {
				const message = tStatic('api_responses.auth.global.unknown_error');
				notifications.error(message);
			}
		}
		oldPassword = '';
		newPassword = '';
	}
</script>

<GuardWrapper>
	<div class="text-center">
		<a href="/"
			><img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt="EcoDeli" /></a
		>
		<h1 class="mt-10 text-xl font-semibold">{$title}</h1>

		<div class="my-5 grid grid-cols-1 gap-6 text-left md:grid-cols-2">
			<form class="space-y-4" on:submit|preventDefault={handleProfileUpdate}>
				<div class="flex gap-2">
					<input
						type="text"
						placeholder={$first_name_placeholder}
						bind:value={first_name}
						class="input input-bordered w-1/2"
						required
					/>
					<input
						type="text"
						placeholder={$last_name_placeholder}
						bind:value={last_name}
						class="input input-bordered w-1/2"
						required
					/>
				</div>
				<input
					type="email"
					placeholder={$email_placeholder}
					bind:value={email}
					class="input input-bordered w-full"
					required
				/>
				<button type="submit" class="btn btn-primary w-full">{$save_profile_button}</button>
			</form>

			<form class="space-y-4" on:submit|preventDefault={handlePasswordUpdate}>
				<input
					type="password"
					placeholder={$old_password_placeholder}
					bind:value={oldPassword}
					class="input input-bordered w-full"
					required
				/>
				<input
					type="password"
					placeholder={$new_password_placeholder}
					bind:value={newPassword}
					class="input input-bordered w-full"
					required
				/>
				<button type="submit" class="btn btn-primary w-full">{$save_password_button}</button>
			</form>

		</div>

		<div class="mt-6">
			<a href="/auth/space">{$return_to_app_link}</a>
		</div>

		<p class="mt-8 text-center text-sm text-gray-500">{@html $support_rgpd}</p>
	</div>
</GuardWrapper>
