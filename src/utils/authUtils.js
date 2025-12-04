const normalizeWineryId = (wineryId) =>
	(wineryId === undefined || wineryId === null
		? ""
		: String(wineryId)
	).toLowerCase();

const COSTAFLORES_IDS = Array.from(
	new Set(
		[
			process.env.NEXT_PUBLIC_COSTAFLORES_WINERY_ID,
			process.env.COSTAFLORES_WINERY_ID,
			"costaflores",
			"costafloras", // common typo safeguard
			"1",
		]
			.filter(Boolean)
			.map((value) => normalizeWineryId(value))
	)
);

export const isAdminUser = (session) => {
	if (!session) return false;
	if (session?.data?.is_admin !== undefined) return session?.data?.is_admin;
	return Boolean(session?.is_admin);
};

export const isCostafloresAdmin = (session) => {
	if (!isAdminUser(session)) return false;
	const wineryId = session?.data?.winery_id ?? session?.winery_id;
	const normalized = normalizeWineryId(wineryId);
	return COSTAFLORES_IDS.includes(normalized);
};
