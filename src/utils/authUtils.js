export const isAdminUser = (session) => {
	return session ? session?.data?.is_admin : false;
};
