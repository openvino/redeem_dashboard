import { useState } from "react";
import { toast } from "react-toastify";
import {
	MdSkipNext,
	MdSkipPrevious,
	MdNavigateNext,
	MdNavigateBefore,
} from "react-icons/md";

export function useTable(
	data,
	elementsPerPage = 10,
	defaultOrder = "created_at"
) {
	const [currentPage, setCurrentPage] = useState(1);
	const [columnOrder, setColumnOrder] = useState(defaultOrder);
	const [ascOrder, setAscOrder] = useState(false);
	const [tooltip, setTooltip] = useState({
		visible: false,
		content: "",
		x: 0,
		y: 0,
	});
	const [isDragging, setIsDragging] = useState(false);
	const [dragStartX, setDragStartX] = useState(0);
	const [scrollStartX, setScrollStartX] = useState(0);

	const handleOrdenarColumna = (columna) => {
		if (columnOrder === columna) {
			setAscOrder(!ascOrder);
		} else {
			setColumnOrder(columna);
			setAscOrder(true);
		}
	};

	const normalizeDate = (val) =>
		new Date(
			String(val).replace(" ", "T").replace(/\+00$/, "+00:00")
		).getTime();

	const orderData = () => {
		if (!columnOrder) return data;
		return [...data].sort((a, b) => {
			const valA = a[columnOrder];
			const valB = b[columnOrder];

			if (valA == null && valB != null) return ascOrder ? -1 : 1;
			if (valA != null && valB == null) return ascOrder ? 1 : -1;
			if (valA == null && valB == null) return 0;

			if (
				columnOrder.toLowerCase().includes("date") ||
				columnOrder === "created_at"
			) {
				const dateA = normalizeDate(valA);
				const dateB = normalizeDate(valB);
				return ascOrder ? dateA - dateB : dateB - dateA;
			}

			if (typeof valA === "number" && typeof valB === "number") {
				return ascOrder ? valA - valB : valB - valA;
			}

			if (typeof valA === "boolean" && typeof valB === "boolean") {
				return ascOrder
					? valA === valB
						? 0
						: valA
						? 1
						: -1
					: valA === valB
					? 0
					: valA
					? -1
					: 1;
			}

			return ascOrder
				? String(valA).localeCompare(String(valB))
				: String(valB).localeCompare(String(valA));
		});
	};

	const orderPagedData = () => {
		const ordered = orderData();
		const totalPages = Math.ceil(ordered.length / elementsPerPage);
		const validPage = Math.max(1, Math.min(currentPage, totalPages));
		const initIndex = (validPage - 1) * elementsPerPage;
		const finalIndex = initIndex + elementsPerPage;
		return ordered.slice(initIndex, finalIndex);
	};

	const handlePrevPage = () => {
		if (currentPage > 1) setCurrentPage(currentPage - 1);
	};

	const handleNextPage = () => {
		const totalPages = Math.ceil(data.length / elementsPerPage);
		if (currentPage < totalPages) setCurrentPage(currentPage + 1);
	};

	const handleSelectPage = (page) => {
		setCurrentPage(page);
	};

	const renderbuttonsPages = () => {
		const totalPages = Math.ceil(data.length / elementsPerPage);
		const buttons = [];
		const start = Math.max(currentPage - 4, 1);
		const end = Math.min(currentPage + 4, totalPages);

		const disabledStyle = "bg-gray-200 text-gray-500";
		const enabledStyle = "bg-gray-200 text-[1C4A]";

		buttons.push(
			<MdSkipPrevious
				key="first"
				size={40}
				onClick={() => handleSelectPage(1)}
				className={`mx-1 px-2 py-1 rounded ${
					currentPage === 1 ? disabledStyle : enabledStyle
				}`}
			/>
		);

		buttons.push(
			<MdNavigateBefore
				key="prev"
				size={40}
				onClick={handlePrevPage}
				className={`mx-1 px-2 py-1 rounded ${
					currentPage === 1 ? disabledStyle : enabledStyle
				}`}
			/>
		);

		for (let i = start; i <= end; i++) {
			buttons.push(
				<button
					key={i}
					onClick={() => handleSelectPage(i)}
					className={`mx-1 px-2 py-1 rounded ${
						i === currentPage ? enabledStyle : disabledStyle
					}`}
				>
					{i}
				</button>
			);
		}

		buttons.push(
			<MdNavigateNext
				key="next"
				size={40}
				onClick={handleNextPage}
				className={`mx-1 px-2 py-1 rounded ${
					currentPage === totalPages ? disabledStyle : enabledStyle
				}`}
			/>
		);

		buttons.push(
			<MdSkipNext
				key="last"
				size={40}
				onClick={() => handleSelectPage(totalPages)}
				className={`mx-1 px-2 py-1 rounded ${
					currentPage === totalPages ? disabledStyle : enabledStyle
				}`}
			/>
		);

		return buttons;
	};

	const handleMouseEnter = (content, event) => {
		const rect = event.target.getBoundingClientRect();
		setTooltip({
			visible: true,
			content,
			x: rect.x + rect.width / 2,
			y: rect.y + window.scrollY - 10,
		});
	};

	const handleMouseLeave = () => {
		!isDragging && setTooltip((prev) => ({ ...prev, visible: false }));
	};

	const handleClickTooltip = (content) => {
		navigator.clipboard.writeText(content);
		toast.success(`Contenido copiado: ${content}`);
	};

	const handleShowTooltip = () => {
		setTooltip((prev) => ({ ...prev, visible: true }));
	};

	const handleMouseDown = (e) => {
		setIsDragging(true);
		setDragStartX(e.clientX);
		setScrollStartX(e.currentTarget.scrollLeft);
	};

	const handleMouseMove = (e) => {
		if (!isDragging) return;
		const dx = e.clientX - dragStartX;
		e.currentTarget.scrollLeft = scrollStartX - dx;
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	return {
		currentPage,
		tooltip,
		handleMouseEnter,
		handleMouseLeave,
		handleClickTooltip,
		handleShowTooltip,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleOrdenarColumna,
		orderPagedData,
		renderbuttonsPages,
	};
}
