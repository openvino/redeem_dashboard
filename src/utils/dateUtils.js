export const formatDateForInput = (date) => {
	const d = new Date(date);
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
		d.getHours()
	)}:${pad(d.getMinutes())}`;
};

export const isValidDate = (date) => {
	const d = new Date(date);
	return d instanceof Date && !isNaN(d);
};
