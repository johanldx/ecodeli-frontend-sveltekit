export const excludedLayoutRoutes = ['/auth'];

export function isExcludedLayoutRoute(pathname: string): boolean {
	if (!pathname) return false;
	return excludedLayoutRoutes.some((excluded) =>
		pathname === excluded || pathname.startsWith(`${excluded}/`)
	);
}
