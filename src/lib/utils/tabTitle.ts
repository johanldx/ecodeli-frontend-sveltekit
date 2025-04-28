import { tStatic } from '$lib/utils/t';

export function tabTitle(path: string) {
	const originalTitle = tStatic(`${path}.tab_title`);
	document.title = originalTitle;

	const handleVisibilityChange = () => {
		document.title = document.hidden ? tStatic('landing.global.tab_message') : originalTitle;
	};

	document.addEventListener('visibilitychange', handleVisibilityChange);

	// retourne une fonction de cleanup à appeler dans onDestroy
	return () => {
		document.removeEventListener('visibilitychange', handleVisibilityChange);
	};
}
