import { goto } from '$app/navigation';
import { notifications } from '$lib/stores/notifications';
import { checkAuth } from '$lib/utils/auth';
import { tStatic } from './t';

export async function guardRoute(redirectTo = '/auth/login') {
	const isValid = await checkAuth();

	if (!isValid) {
		const message = tStatic('api_responses.auth.global.session_expired');
		notifications.error(message);
		goto(redirectTo);
		return false;
	}

	return true;
}
