import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
	MdSkipNext,
	MdSkipPrevious,
	MdNavigateNext,
	MdNavigateBefore,
} from "react-icons/md";

const DEFAULT_ROW_ID = (row, index) => {
	if (row?.id != null) return String(row.id);
	const firstValue = row ? Object.values(row)[0] : null;
	return `${firstValue ?? "row"}-${index}`;
};

export function useTable(
	input,
	fallbackElementsPerPage = 10,
	fallbackDefaultOrder = "created_at"
) {
	const config = useMemo(() => {
		if (Array.isArray(input) || input == null) {
			return {
				data: Array.isArray(input) ? input : [],
				columns: [],
				elementsPerPage: fallbackElementsPerPage,
				defaultOrder: fallbackDefaultOrder,
			};
		}
		return {
			data: Array.isArray(input.data) ? input.data : [],
			columns: Array.isArray(input.columns) ? input.columns : [],
			elementsPerPage:
				input.elementsPerPage ?? fallbackElementsPerPage ?? 10,
			defaultOrder: input.defaultOrder ?? fallbackDefaultOrder ?? "created_at",
			rowIdAccessor: input.rowIdAccessor ?? DEFAULT_ROW_ID,
		};
	}, [input, fallbackElementsPerPage, fallbackDefaultOrder]);

	const {
		data,
		columns,
		elementsPerPage,
		defaultOrder,
		rowIdAccessor = DEFAULT_ROW_ID,
	} = config;

	const [currentPage, setCurrentPage] = useState(1);
	const [columnOrder, setColumnOrder] = useState(
		defaultOrder ?? columns?.[0]?.field ?? null
	);
	const [ascOrder, setAscOrder] = useState(true);

	const [filters, setFilters] = useState(() =>
		columns.reduce((acc, column) => {
			acc[column.field] = "";
			return acc;
		}, {})
	);

	useEffect(() => {
		setFilters((prev) => {
			const next = {};
			columns.forEach((column) => {
				next[column.field] = prev?.[column.field] ?? "";
			});
			return next;
		});
	}, [columns]);

	const [tooltip, setTooltip] = useState({
		visible: false,
		content: "",
		x: 0,
		y: 0,
	});
	const [isDragging, setIsDragging] = useState(false);
	const [dragStartX, setDragStartX] = useState(0);
	const [scrollStartX, setScrollStartX] = useState(0);

	const [selectedRowIds, setSelectedRowIds] = useState(new Set());

	useEffect(() => {
		setSelectedRowIds(new Set());
	}, [data]);

	const handleSortColumn = (column) => {
		if (columnOrder === column) {
			setAscOrder(!ascOrder);
		} else {
			setColumnOrder(column);
			setAscOrder(true);
		}
	};

	const normalizeDate = (val) =>
		new Date(
			String(val).replace(" ", "T").replace(/\+00$/, "+00:00")
		).getTime();

	const filteredData = useMemo(() => {
		const hasFilters = Object.values(filters ?? {}).some((value) => value);
		if (!hasFilters) return data;

		return data.filter((row) =>
			columns.every((column) => {
				const filterValue = filters[column.field];
				if (!filterValue) return true;
				const cellValue = row?.[column.field];
				if (cellValue == null) return false;
				return String(cellValue)
					.toLowerCase()
					.includes(String(filterValue).toLowerCase());
			})
		);
	}, [columns, data, filters]);

	const orderedData = useMemo(() => {
		if (!columnOrder) return filteredData;
		return [...filteredData].sort((a, b) => {
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
	}, [ascOrder, columnOrder, filteredData]);

	const totalPages = useMemo(() => {
		const value = Math.ceil(orderedData.length / elementsPerPage);
		return value > 0 ? value : 1;
	}, [elementsPerPage, orderedData.length]);

	useEffect(() => {
		setCurrentPage((prev) => Math.min(prev, totalPages));
	}, [totalPages]);

	const orderPagedData = useCallback(() => {
		if (orderedData.length === 0) return [];
		const validPage = Math.max(1, Math.min(currentPage, totalPages));
		const initIndex = (validPage - 1) * elementsPerPage;
		const finalIndex = initIndex + elementsPerPage;
		return orderedData.slice(initIndex, finalIndex);
	}, [currentPage, elementsPerPage, orderedData, totalPages]);

	const handlePrevPage = () => {
		if (currentPage > 1) setCurrentPage(currentPage - 1);
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) setCurrentPage(currentPage + 1);
	};

	const handleSelectPage = (page) => {
		setCurrentPage(page);
	};

	const renderPageButtons = () => {
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
		toast.success(`Content copied: ${content}`);
	};

	const handleShowTooltip = () => {
		setTooltip((prev) => ({ ...prev, visible: true }));
	};

	const getClientX = (event) => {
		if (!event) return 0;
		if (event.touches && event.touches.length > 0) {
			return event.touches[0].clientX;
		}
		if (event.changedTouches && event.changedTouches.length > 0) {
			return event.changedTouches[0].clientX;
		}
		return event.clientX ?? 0;
	};

	const handleMouseDown = (event) => {
		if (event?.button != null && event.button !== 0) return;
		setIsDragging(true);
		setDragStartX(getClientX(event));
		setScrollStartX(event.currentTarget.scrollLeft);
	};

	const handleMouseMove = (event) => {
		if (!isDragging) return;
		const dx = getClientX(event) - dragStartX;
		if (event.cancelable) {
			event.preventDefault();
		}
		event.currentTarget.scrollLeft = scrollStartX - dx;
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleTouchStart = (event) => {
		setIsDragging(true);
		setDragStartX(getClientX(event));
		setScrollStartX(event.currentTarget.scrollLeft);
	};

	const handleTouchMove = (event) => {
		if (!isDragging) return;
		const dx = getClientX(event) - dragStartX;
		if (event.cancelable) {
			event.preventDefault();
		}
		event.currentTarget.scrollLeft = scrollStartX - dx;
	};

	const handleTouchEnd = () => {
		setIsDragging(false);
	};

	const setFilterValue = useCallback((field, value) => {
		setFilters((prev) => ({ ...prev, [field]: value }));
		setCurrentPage(1);
	}, []);

	const clearFilters = useCallback(() => {
		setFilters((prev) =>
			Object.keys(prev).reduce((acc, key) => {
				acc[key] = "";
				return acc;
			}, {})
		);
		setCurrentPage(1);
	}, []);

	const rowIdsMap = useMemo(() => {
		const map = new Map();
		orderedData.forEach((row, index) => {
			map.set(rowIdAccessor(row, index), row);
		});
		return map;
	}, [orderedData, rowIdAccessor]);

	const pagedRowIds = useMemo(() => {
		const validPage = Math.max(1, Math.min(currentPage, totalPages));
		const startIndex = (validPage - 1) * elementsPerPage;
		const rows = orderPagedData();
		return rows.map((row, idx) => rowIdAccessor(row, startIndex + idx));
	}, [
		currentPage,
		elementsPerPage,
		orderPagedData,
		rowIdAccessor,
		totalPages,
	]);

	const toggleRowSelection = useCallback((rowId) => {
		setSelectedRowIds((prev) => {
			const next = new Set(prev);
			if (next.has(rowId)) {
				next.delete(rowId);
			} else {
				next.add(rowId);
			}
			return next;
		});
	}, []);

	const isRowSelected = useCallback(
		(rowId) => selectedRowIds.has(rowId),
		[selectedRowIds]
	);

	const toggleSelectAllCurrentPage = useCallback(() => {
		setSelectedRowIds((prev) => {
			const next = new Set(prev);
			const allSelected = pagedRowIds.every((id) => next.has(id));
			if (allSelected) {
				pagedRowIds.forEach((id) => next.delete(id));
			} else {
				pagedRowIds.forEach((id) => next.add(id));
			}
			return next;
		});
	}, [pagedRowIds]);

	const clearSelection = useCallback(() => {
		setSelectedRowIds(new Set());
	}, []);

	const isAllCurrentPageSelected =
		pagedRowIds.length > 0 &&
		pagedRowIds.every((id) => selectedRowIds.has(id));

	const selectedRowsData = useMemo(() => {
		return Array.from(selectedRowIds)
			.map((id) => rowIdsMap.get(id))
			.filter(Boolean);
	}, [rowIdsMap, selectedRowIds]);

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
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleSortColumn,
		orderPagedData,
		renderPageButtons,
		filters,
		setFilterValue,
		clearFilters,
		filteredData,
		toggleRowSelection,
		isRowSelected,
		toggleSelectAllCurrentPage,
		isAllCurrentPageSelected,
		selectedRowsData,
		clearSelection,
		isDragging,
	};
}
