import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeLayout from "@/components/HomeLayout";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
	DAO_DEFAULT_VALUES,
	getDaoProvisioningRecord,
	updateDaoProvisioningRecord,
	loadDaoProvisioningRecords,
} from "@/utils/daoProvisioningUtils";
import FormField from "@/components/FormField";
import { ROUTE_CONSTANTS } from "@/utils/tableUtils";
import { getSession, useSession } from "next-auth/react";
import useDaoDeployment from "@/hooks/useDaoDeployment";

const DaoProvisioningDetail = () => {
	const router = useRouter();
	const { id } = router.query;
	const { t } = useTranslation();
	const session = useSession();

	const [record, setRecord] = useState(null);

	const { register, handleSubmit, reset, getValues, setValue } = useForm({
		defaultValues: DAO_DEFAULT_VALUES,
	});
	const { handleDeployDao } = useDaoDeployment({
		getValues,
		setValue,
		setRecord,
	});

	useEffect(() => {
		if (!router.isReady) return;
		const fetchRecord = async () => {
			let existing = null;
			if (id && id !== "launch") {
				existing = await getDaoProvisioningRecord(id);
			} else {
				const all = await loadDaoProvisioningRecords();
				existing = Array.isArray(all) && all.length > 0 ? all[0] : null;
			}

			if (existing) {
				setRecord(existing);
				reset({
					...DAO_DEFAULT_VALUES,
					...existing,
					token_address: existing.token_address || existing.address || "",
				});
				return;
			}

			reset({
				...DAO_DEFAULT_VALUES,
				id: id && id !== "launch" ? id : "",
			});
		};
		fetchRecord();
	}, [router.isReady, id, reset]);

	const handleSaveDraft = async () => {
		const values = getValues();
		const allowedFields = [
			"id",
			"name",
			"symbol",
			"recipient",
			"default_admin",
			"rebaser",
			"split_oracle",
			"governor",
			"timelock",
			// address mapped below
		];
		const effectiveId =
			record?.id ?? (id && id !== "launch" ? id : null);
		if (!effectiveId) {
			toast.error(
				t("error_updating", { defaultValue: "Error updating DAO draft" })
			);
			return;
		}
		const payload = { id: effectiveId };
		allowedFields.forEach((field) => {
			if (values[field] !== undefined) {
				payload[field] = values[field];
			}
		});
		payload.address = values.token_address || values.address || record?.address || "";
		try {
			const updated = await updateDaoProvisioningRecord(payload.id, payload);
			setRecord(updated);
			toast.success(
				t("dao_saved", {
					defaultValue: "DAO draft saved",
				})
			);
			router.push(ROUTE_CONSTANTS.DAO_PROVISIONING_ROUTE);
		} catch (error) {
			console.error("Error updating DAO draft:", error);
			toast.error(
				t("error_updating", { defaultValue: "Error updating DAO draft" })
			);
		}
	};

	useEffect(() => {
		if (record) return;
		const walletAddress = session?.data?.address;
		if (!walletAddress) return;
		const lower = walletAddress.toLowerCase();
		if (!getValues("default_admin")) {
			setValue("default_admin", lower);
		}
		if (!getValues("rebaser")) {
			setValue("rebaser", lower);
		}
	}, [record, session?.data?.address, setValue, getValues]);

	const handleDeployPlaceholder = (key) => {
		const labels = {
			token: t("deploy_ovi", { defaultValue: "Deploy OVI" }),
			crowdsale: t("deploy_ovi_crowdsale", {
				defaultValue: "Deploy OVI crowdsale",
			}),
			dao: t("deploy_dao_contracts", {
				defaultValue: "Deploy DAO contracts",
			}),
		};
		toast.info(
			t("dao_deploy_placeholder", {
				defaultValue: "Deployment pending ABI integration.",
			}) +
				" " +
				(labels[key] || ""),
			{ theme: "dark", autoClose: 2200 }
		);
	};

	return (
		<HomeLayout>
			<ToastContainer />
			<div className="p-4 w-full overflow-x-auto lg:overflow-x-hidden space-y-6">
				<div className="flex items-center gap-4">
					<img
						src="/assets/ovi-logo.png"
						alt="OVI logo"
						className="h-16 w-16 rounded-full object-contain bg-white shadow"
						onError={(e) => {
							e.currentTarget.onerror = null;
							e.currentTarget.src = "/assets/ovi-logo.svg";
						}}
					/>
					<div>
						<h1 className="text-2xl font-bold">
							{t("dao_provisioning_title", {
								defaultValue: "OpenVino DAO provisioning",
							})}
						</h1>
						<p className="text-gray-600">
							{t("dao_provisioning_detail_subtitle", {
								defaultValue: "Launch DAO contracts.",
							})}
						</p>
					</div>
				</div>

				<form
					className="space-y-6 max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-md"
					onSubmit={handleSubmit(() => {})}
				>
					{/* Token config */}
					<h2 className="text-xl font-semibold">
						{t("dao_base_config", {
							defaultValue: "Token setup",
						})}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<FormField label={t("token_name")} required {...register("name")} />
						<FormField
							label={t("token_symbol")}
							required
							{...register("symbol")}
						/>
						<FormField
							label={t("initial_mint_amount")}
							type="text"
							value="10,000,000"
							disabled
						/>
						<FormField
							label={t("recipient")}
							placeholder="0x..."
							{...register("recipient")}
						/>
						<FormField
							label={t("address")}
							type="text"
							{...register("token_address")}
							disabled
						/>
					</div>

					<h2 className="text-xl font-semibold">
						{t("dao_roles_config", { defaultValue: "Roles & permissions" })}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<FormField
							label={t("default_admin")}
							placeholder="0x..."
							{...register("default_admin")}
						/>
						<FormField
							label={t("rebaser")}
							placeholder="0x..."
							{...register("rebaser")}
						/>
						<FormField
							label={t("split_oracle")}
							placeholder="0x..."
							{...register("split_oracle")}
						/>
					</div>

					{/* Crowdsale references */}
					<h2 className="text-xl font-semibold">
						{t("crowdsale_config", { defaultValue: "Crowdsale" })}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<FormField
							label={t("crowdsale_address")}
							type="text"
							{...register("crowdsale_address")}
							disabled
						/>
					</div>

					{/* DAO references */}
					<h2 className="text-xl font-semibold">
						{t("dao_addresses", { defaultValue: "Deployment references" })}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<FormField
							label={t("governor")}
							type="text"
							placeholder="0x..."
							{...register("governor")}
							disabled
						/>
						<FormField
							label={t("timelock")}
							type="text"
							placeholder="0x..."
							{...register("timelock")}
							disabled
						/>
						<FormField
							label={t("wovi_address")}
							type="text"
							placeholder="0x..."
							{...register("wovi_address")}
							disabled
						/>
					</div>

					<div className="flex flex-wrap justify-between gap-3">
						<button
							type="button"
							onClick={() => router.back()}
							className="px-6 py-2 bg-gray-300 rounded"
						>
							{t("volver")}
						</button>
						<div className="flex flex-wrap gap-3">
							<button
								type="button"
								onClick={handleSaveDraft}
								className="px-6 py-2 rounded text-white bg-green-700"
							>
								{t("save_token")}
							</button>
								<button
									type="button"
									onClick={() => handleDeployDao().catch(() => {})}
									className="px-6 py-2 rounded text-white bg-[#840C4A]"
								>
									{t("deploy_ovi", { defaultValue: "Deploy OVI" })}
								</button>
							<button
								type="button"
								onClick={() => handleDeployPlaceholder("crowdsale")}
								className="px-6 py-2 rounded text-white bg-blue-700"
							>
								{t("deploy_ovi_crowdsale", {
									defaultValue: "Deploy OVI crowdsale",
								})}
							</button>
							<button
								type="button"
								onClick={() => handleDeployPlaceholder("dao")}
								className="px-6 py-2 rounded text-white bg-purple-700"
							>
								{t("deploy_dao_contracts", {
									defaultValue: "Deploy DAO contracts",
								})}
							</button>
						</div>
					</div>
				</form>
			</div>
		</HomeLayout>
	);
};

export default DaoProvisioningDetail;

export async function getServerSideProps(context) {
	const session = await getSession(context);

	if (!session) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	const normalize = (value) =>
		(value === undefined || value === null ? "" : String(value)).toLowerCase();
	const allowedIds = new Set(
		[
			process.env.NEXT_PUBLIC_COSTAFLORES_WINERY_ID,
			process.env.COSTAFLORES_WINERY_ID,
			"costaflores",
			"1",
		]
			.filter(Boolean)
			.map((val) => normalize(val))
	);
	const userWineryId = normalize(session.winery_id);
	const isAuthorized =
		Boolean(session.is_admin) && userWineryId && allowedIds.has(userWineryId);

	if (!isAuthorized) {
		return {
			redirect: {
				destination: "/dashboard",
				permanent: false,
			},
		};
	}

	return { props: {} };
}
