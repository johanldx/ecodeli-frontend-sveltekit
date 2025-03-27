import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	throw redirect(307, '/auth/space'); // ou vers la destination souhaitée
};
