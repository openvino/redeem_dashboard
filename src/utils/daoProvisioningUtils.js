import clientAxios from "@/config/clientAxios";

const STORAGE_KEY = "dao-provisioning-records";
export const DAO_DEFAULT_LOGO = "/assets/ovi-logo.png";

export const DAO_DEFAULT_VALUES = {
	id: "",
	name: "OpenvinoDao",
	symbol: "OVI",
	recipient: "",
	default_admin: "",
	rebaser: "",
	split_oracle: "",
	timelock: "",
	governor: "",
	wovi_address: "",
	initial_mint_amount: "10000000",
	description: "",
	token_image: DAO_DEFAULT_LOGO,
	token_address: "",
	crowdsale_address: "",
};

const normalizeRecord = (record) => ({
	...DAO_DEFAULT_VALUES,
	...record,
	token_address: record?.token_address || record?.address || "",
});

export const loadDaoProvisioningRecords = async () => {
	try {
		const response = await clientAxios.get(`/daoLaunch`, {});
		const data = Array.isArray(response.data) ? response.data : [];
		return data.map(normalizeRecord);
	} catch (error) {
		console.error(error);
		return [];
	}
};

export const getDaoProvisioningRecord = async (id) => {
	if (id === undefined || id === null) return null;
	const records = await loadDaoProvisioningRecords();
	return records.find((record) => String(record.id) === String(id)) || null;
};

export const updateDaoProvisioningRecord = async (id, fields) => {
	if (!id) throw new Error("ID is required");
	const payload = { id, ...fields };
	const response = await clientAxios.patch(`/daoLaunch`, {
		params: payload,
	});
	return response.data;
};
