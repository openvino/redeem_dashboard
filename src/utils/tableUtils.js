// Rutas reutilizables
export const ROUTE_CONSTANTS = {
	DETAIL_ROUTE: "/detail",
	NEW_DETAIL_ROUTE: "",
	LABEL_NEW_DETAIL: "",

	ADMIN_ROUTE: "/admin",
	NEW_ADMIN_ROUTE: "/addUser",
	LABEL_NEW_ADMIN: "add_admin",

	WINARY_ROUTE: "/wineryDetail",
	NEW_WINARY_ROUTE: "/newWinary",
	LABEL_NEW_WINARY: "crear_bodega",

	PROVISIONING_ROUTE: "/provisioning",
	NEW_PROVISIONING_ROUTE: "/launch",
	LABEL_NEW_PROVISIONING: "launch",
};

const routeKeys = Object.keys(ROUTE_CONSTANTS)
	.filter((key) => key.endsWith("_ROUTE") && !key.startsWith("NEW_"))
	.map((key) => key.replace("_ROUTE", ""));

export const tableRoutes = Object.fromEntries(
	routeKeys.map((key) => {
		const base = ROUTE_CONSTANTS[`${key}_ROUTE`];
		const newPath = ROUTE_CONSTANTS[`NEW_${key}_ROUTE`] || "";
		const label = ROUTE_CONSTANTS[`LABEL_NEW_${key}`] || "";

		return [
			base,
			{
				actionRoute:
					base !== ROUTE_CONSTANTS.DETAIL_ROUTE ? `${base}${newPath}` : "",
				label,
			},
		];
	})
);

export const getStatusColor = (status) => {
	switch (status) {
		case "success":
			return "text-green-500";
		case "pending":
			return "text-yellow-500";
		case "rejected":
			return "text-red-500";
		default:
			return "text-gray-500";
	}
};
