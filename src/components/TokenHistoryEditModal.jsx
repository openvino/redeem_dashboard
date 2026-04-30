import React, { useEffect, useMemo, useState } from "react";

const normalizeValue = (value) => {
	if (value === null || value === undefined) return "";
	if (value instanceof Date) return value.toISOString();
	return String(value);
};

const labelFromField = (field) =>
	field
		.replace(/_/g, " ")
		.replace(/([a-z])([A-Z])/g, (_, a, b) => `${a} ${b}`)
		.replace(/\b\w/g, (char) => char.toUpperCase());

const KEY_ALIAS = {
	bottlesStock: "bottles_stock",
	pendingRedeems: "pending_redeems",
	lastDataCid: "last_data_cid",
	reserveAddresses: "reserve_addresses",
};

const DEFAULT_FIELD_ORDER = [
	{ key: "id", label: "Id" },
	{ key: "symbol", label: "Symbol" },
	{ key: "chain", label: "Chain" },
	{ key: "winary", label: "Winary" },
	{ key: "pending_redeems", label: "Tokens a quemar", editable: true },
	{ key: "reserve_addresses", label: "Wallets reserva OpenVino (separadas por coma)", editable: true },
	{ key: "last_data_cid", label: "Last Data Cid", editable: true },
];

const TokenHistoryEditModal = ({
	open,
	record,
	editableFields = [],
	onClose,
	onSubmit,
	isSubmitting = false,
}) => {
	const [formValues, setFormValues] = useState({});

	useEffect(() => {
		if (!record || typeof record !== "object") {
			setFormValues({});
			return;
		}

		const normalized = {};
		for (const [rawKey, value] of Object.entries(record)) {
			const aliasKey = KEY_ALIAS[rawKey] ?? rawKey;
			if (normalized[aliasKey] === undefined) {
				normalized[aliasKey] = value;
			}
		}
		setFormValues(normalized);
	}, [record]);

	const editableSet = useMemo(() => {
		const set = new Set([
			"pending_redeems",
			"reserve_addresses",
			"last_data_cid",
			...editableFields,
		]);
		for (const [source, target] of Object.entries(KEY_ALIAS)) {
			if (set.has(target)) set.add(source);
		}
		return set;
	}, [editableFields]);

	const handleChange = (field, value) => {
		setFormValues((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		if (isSubmitting) return;
		onSubmit?.(formValues);
	};

	const fields = useMemo(() => {
		if (!formValues || typeof formValues !== "object") return [];
		const entries = [];
		const added = new Set();

		const pushField = (key, value) => {
			if (value === undefined || added.has(key)) return;
			added.add(key);
			entries.push([key, value]);
		};

		DEFAULT_FIELD_ORDER.forEach(({ key }) => {
			const candidate = formValues[key];
			if (candidate !== undefined) {
				pushField(key, candidate);
			}
		});

		for (const [field, value] of Object.entries(formValues)) {
			const canonical = KEY_ALIAS[field] ?? field;
			if (!added.has(canonical)) {
				pushField(canonical, value);
			}
		}

		return entries;
	}, [formValues]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="absolute inset-0 bg-black/40"
				onClick={onClose}
				role="presentation"
			/>
			<div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
				<h2 className="text-xl font-semibold text-gray-900">
					Edit Token History
				</h2>
				<form onSubmit={handleSubmit} className="mt-6 space-y-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{fields.map(([field, value]) => {
							const editable = editableSet.has(field);
							const inputDisabled = !editable || isSubmitting;
							const label =
								DEFAULT_FIELD_ORDER.find((item) => item.key === field)?.label ??
								labelFromField(field);
							return (
								<label
									key={field}
									className="flex flex-col gap-1 text-sm text-gray-700"
								>
									<span className="font-medium text-gray-600">
										{label}
									</span>
									<input
										type="text"
										value={normalizeValue(value)}
										onChange={(event) =>
											handleChange(field, event.target.value)
										}
										disabled={inputDisabled}
										className={`w-full rounded-lg border px-3 py-2 text-sm ${
											!inputDisabled
												? "border-gray-300 focus:border-[#840C4A] focus:outline-none focus:ring-2 focus:ring-[#840C4A]/20"
												: "border-gray-200 bg-gray-100 text-gray-500"
										}`}
									/>
								</label>
							);
						})}
					</div>
					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="rounded-lg bg-[#840C4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6d0a3d] disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSubmitting ? "Saving..." : "Save"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default TokenHistoryEditModal;
