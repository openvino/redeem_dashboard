const normalizeToDate = (value) => {
	if (value instanceof Date) return value;
	if (typeof value === "number") {
		const ms = value > 1e12 ? value : value * 1000;
		return new Date(ms);
	}
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (trimmed === "") return new Date(NaN);
		if (/^\d+(\.\d+)?$/.test(trimmed)) {
			const numeric = Number(trimmed);
			const ms = numeric > 1e12 ? numeric : numeric * 1000;
			return new Date(ms);
		}
		return new Date(trimmed);
	}
	return new Date(value);
};

export const formatDateForInput = (date) => {
	const d = normalizeToDate(date);
	if (Number.isNaN(d.getTime())) return "";
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
		d.getHours()
	)}:${pad(d.getMinutes())}`;
};

export const isValidDate = (date) => {
	const d = normalizeToDate(date);
	return d instanceof Date && !isNaN(d);
};

export const toTimestamp = (dateString) => {
	const date = normalizeToDate(dateString);
	const ms = date.getTime();
	return Number.isNaN(ms) ? NaN : ms / 1000;
};
