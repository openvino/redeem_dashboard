"use client";

import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import Link from "next/link";
import { FaPencilAlt, FaRocket, FaRegCopy, FaCheck } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { ROUTE_CONSTANTS, tableRoutes } from "@/utils/tableUtils";
import { useTable } from "@/hooks/useTable";
import { isAdminUser } from "@/utils/authUtils";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

const Table = ({
	data,
	columnas,
	n,
	route = "/detail",
	copyExcludedFields = [],
}) => {
	const { t } = useTranslation();
	const router = useRouter();
	const showModal = useSelector((state) => state.notification.showModal);
	const session = useSession();

	const defaultFilterColumn = useMemo(
		() =>
			columnas?.find((col) => col.field && col.field !== "acciones")?.field ??
			columnas?.[0]?.field ??
			"",
		[columnas]
	);
	const rowIdAccessor = useCallback(
		(row, index) => {
			if (row?.id != null) return String(row.id);
			const firstRelevant = columnas?.find(
				(col) => col.field && col.field !== "acciones"
			);
			if (firstRelevant) {
				const value = row?.[firstRelevant.field];
				if (value != null) return `${firstRelevant.field}-${value}-${index}`;
			}
			return `row-${index}`;
		},
		[columnas]
	);

	const {
		currentPage,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		renderbuttonsPages,
		orderPagedData,
		handleOrdenarColumna,
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
	} = useTable({
		data,
		columns: columnas ?? [],
		elementsPerPage: n,
		rowIdAccessor,
		defaultOrder: columnas?.[0]?.field,
	});

	const [activeFilterColumn, setActiveFilterColumn] =
		useState(defaultFilterColumn);
	const [columnWidths, setColumnWidths] = useState([]);
	const resizeHandlersRef = useRef(null);
	const [copiedCellKey, setCopiedCellKey] = useState(null);
	const clearCopyTimeoutRef = useRef(null);
	const isInteractiveElement = useCallback((target) => {
		if (!target) return false;
		return Boolean(
			target.closest(
				"a, button, input, textarea, select, [role='button'], [data-prevent-drag]"
			)
		);
	}, []);
	const handleTableMouseDown = useCallback(
		(event) => {
			if (event?.button != null && event.button !== 0) return;
			if (isInteractiveElement(event.target)) return;
			handleMouseDown(event);
		},
		[handleMouseDown, isInteractiveElement]
	);
	const handleTableTouchStart = useCallback(
		(event) => {
			if (isInteractiveElement(event.target)) return;
			handleTouchStart(event);
		},
		[handleTouchStart, isInteractiveElement]
	);
	const copyExcludedFieldSet = useMemo(() => {
		const fromColumns =
			columnas
				?.filter((col) => col && col.disableCopy)
				.map((col) => col.field) ?? [];
		return new Set([...(copyExcludedFields ?? []), ...fromColumns]);
	}, [columnas, copyExcludedFields]);

	useEffect(() => {
		setActiveFilterColumn(defaultFilterColumn);
	}, [defaultFilterColumn]);

	useEffect(() => {
		if (!columnas) {
			setColumnWidths([]);
			return;
		}
		setColumnWidths((prev) =>
			columnas.map((col, idx) => {
				if (prev && typeof prev[idx] === "number") return prev[idx];
				if (col.field === "acciones") return 100;
				return 160;
			})
		);
	}, [columnas]);

	useEffect(() => {
		return () => {
			const handlers = resizeHandlersRef.current;
			if (handlers) {
				window.removeEventListener("mousemove", handlers.move);
				window.removeEventListener("mouseup", handlers.up);
				window.removeEventListener("touchmove", handlers.move);
				window.removeEventListener("touchend", handlers.up);
				window.removeEventListener("touchcancel", handlers.up);
			}
		};
	}, []);

	const paginatedRows = useMemo(() => orderPagedData(), [orderPagedData]);
	const hasRows = paginatedRows.length > 0;
	const filterValue = activeFilterColumn
		? filters?.[activeFilterColumn] ?? ""
		: "";
	const activeFilters = useMemo(
		() =>
			Object.entries(filters ?? {}).filter(
				([, value]) => value != null && value !== ""
			),
		[filters]
	);

	const handleCopyValue = useCallback(
		(value, key) => {
			if (value == null || value === "") {
				toast.info(
					t("tabla_nada_para_copiar", { defaultValue: "Nada para copiar" })
				);
				return;
			}
			navigator.clipboard
				.writeText(String(value))
				.then(() => {
					if (clearCopyTimeoutRef.current) {
						clearTimeout(clearCopyTimeoutRef.current);
					}
					setCopiedCellKey(key);
					clearCopyTimeoutRef.current = setTimeout(() => {
						setCopiedCellKey(null);
					}, 1200);
					toast.success(
						t("tabla_copiado", {
							defaultValue: "Valor copiado al portapapeles",
						})
					);
				})
				.catch(() => {
					toast.error(
						t("tabla_error_copiar", {
							defaultValue: "No se pudo copiar el valor",
						})
					);
				});
		},
		[t]
	);

	useEffect(() => {
		return () => {
			if (clearCopyTimeoutRef.current) {
				clearTimeout(clearCopyTimeoutRef.current);
			}
		};
	}, []);

	const handleExportCsv = useCallback(() => {
		if (!selectedRowsData.length) {
			toast.info(
				t("tabla_selecciona_para_exportar", {
					defaultValue: "Seleccioná al menos un registro",
				})
			);
			return;
		}

		const normalizeCsvValue = (value, field) => {
			if (copyExcludedFieldSet.has(field)) {
				if (React.isValidElement(value)) {
					if (value.type === FaCheck)
						return t("tabla_si", { defaultValue: "Sí" });
					if (value.type === IoMdClose)
						return t("tabla_no", { defaultValue: "No" });
					return "";
				}
				if (typeof value === "boolean") {
					return value
						? t("tabla_si", { defaultValue: "Sí" })
						: t("tabla_no", { defaultValue: "No" });
				}
			}
			if (value == null) return "";
			if (React.isValidElement(value)) {
				if (value.type === FaCheck) return t("tabla_si", { defaultValue: "Sí" });
				if (value.type === IoMdClose)
					return t("tabla_no", { defaultValue: "No" });
				const childText = value.props?.children;
				if (typeof childText === "string" || typeof childText === "number") {
					return String(childText);
				}
				return "";
			}
			if (typeof value === "boolean") {
				return value
					? t("tabla_si", { defaultValue: "Sí" })
					: t("tabla_no", { defaultValue: "No" });
			}
			if (typeof value === "object") {
				try {
					return JSON.stringify(value);
				} catch {
					return "";
				}
			}
			return String(value);
		};

		const headers = columnas
			.filter((col) => col.field !== "acciones")
			.map((col) => col.title ?? col.field);

		const rows = selectedRowsData.map((row) =>
			columnas
				.filter((col) => col.field !== "acciones")
				.map((col) => {
					const cell = row?.[col.field];
					if (cell == null) return "";
					const value =
						col.field === "created_at"
							? new Date(cell).toLocaleDateString("es-AR")
							: normalizeCsvValue(cell, col.field);
					const str = String(value);
					return str.includes(",") || str.includes('"')
						? `"${str.replace(/"/g, '""')}"`
						: str;
				})
				.join(",")
		);

		const csvContent = [headers.join(","), ...rows].join("\n");
		const blob = new Blob([`\ufeff${csvContent}`], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute(
			"download",
			`export-${new Date().toISOString().slice(0, 10)}.csv`
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		toast.success(
			t("tabla_exportacion_ok", {
				defaultValue: "Archivo CSV exportado con éxito",
			})
		);
	}, [columnas, selectedRowsData, t, copyExcludedFieldSet]);

	const handleClearFilters = useCallback(() => {
		clearFilters();
		clearSelection();
	}, [clearFilters, clearSelection]);

	const pageSize = (() => {
		const parsed = Number(n);
		return !Number.isNaN(parsed) && parsed > 0 ? parsed : 10;
	})();

	const getPointerClientX = useCallback((event) => {
		if (!event) return 0;
		if (event.touches && event.touches.length > 0) {
			return event.touches[0].clientX;
		}
		if (event.changedTouches && event.changedTouches.length > 0) {
			return event.changedTouches[0].clientX;
		}
		return event.clientX ?? 0;
	}, []);

	const handleResizeStart = useCallback(
		(index, event) => {
			if (event.type === "mousedown" && event.button !== 0) return;
			event.preventDefault();
			event.stopPropagation();
			const startX = getPointerClientX(event);
			const startWidth = columnWidths[index] ?? 160;

			const moveHandler = (moveEvent) => {
				const clientX = getPointerClientX(moveEvent);
				const delta = clientX - startX;
				if (moveEvent.cancelable) {
					moveEvent.preventDefault();
				}
				setColumnWidths((prev) => {
					const next = [...prev];
					next[index] = Math.max(80, startWidth + delta);
					return next;
				});
			};

			const upHandler = () => {
				window.removeEventListener("mousemove", moveHandler);
				window.removeEventListener("mouseup", upHandler);
				window.removeEventListener("touchmove", moveHandler);
				window.removeEventListener("touchend", upHandler);
				window.removeEventListener("touchcancel", upHandler);
				resizeHandlersRef.current = null;
			};

			resizeHandlersRef.current = { move: moveHandler, up: upHandler };
			window.addEventListener("mousemove", moveHandler);
			window.addEventListener("mouseup", upHandler);
			window.addEventListener("touchmove", moveHandler, { passive: false });
			window.addEventListener("touchend", upHandler);
			window.addEventListener("touchcancel", upHandler);
		},
		[columnWidths, getPointerClientX]
	);

	return (
		<>
			<div className=" mb-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-2">
					<label className="text-gray-600">
						{t("tabla_filtrar_por", { defaultValue: "Filtrar por" })}
					</label>
					<select
						className="rounded border border-gray-300 px-2 py-1"
						value={activeFilterColumn}
						onChange={(e) => setActiveFilterColumn(e.target.value)}
					>
						{columnas
							?.filter((col) => col.field !== "acciones")
							.map((columna) => (
								<option key={columna.field} value={columna.field}>
									{columna.title}
								</option>
							))}
					</select>
					<input
						type="text"
						className="rounded border border-gray-300 px-2 py-1"
						placeholder={t("tabla_filtrar_placeholder", {
							defaultValue: "Escribí para filtrar",
						})}
						value={filterValue}
						onChange={(e) =>
							activeFilterColumn &&
							setFilterValue(activeFilterColumn, e.target.value)
						}
					/>
					<button
						type="button"
						className="rounded bg-gray-200 px-2 py-1 text-gray-700 hover:bg-gray-300"
						onClick={handleClearFilters}
					>
						{t("tabla_limpiar", { defaultValue: "Limpiar" })}
					</button>
					<span className="text-gray-500">
						{t("tabla_resultados", { defaultValue: "Resultados" })}:{" "}
						{filteredData.length}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-gray-600">
						{t("tabla_seleccionados", { defaultValue: "Seleccionados" })}:{" "}
						{selectedRowsData.length}
					</span>
					<button
						type="button"
						className="rounded bg-[#840C4A] px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-60"
						onClick={handleExportCsv}
						disabled={!selectedRowsData.length}
					>
						{t("tabla_exportar_csv", { defaultValue: "Exportar CSV" })}
					</button>
				</div>
			</div>

			{activeFilters.length > 0 && (
				<div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-gray-700">
					{activeFilters.map(([field, value]) => (
						<span
							key={field}
							className="inline-flex items-center gap-1 rounded bg-gray-200 px-2 py-1"
						>
							{columnas.find((col) => col.field === field)?.title ?? field}
							<span className="font-semibold">=</span>
							{value}
						</span>
					))}
				</div>
			)}

			<div style={{ userSelect: "none" }}>
				<div
					className={`overflow-x-auto ${
						isDragging ? "cursor-grabbing" : "cursor-grab"
					}`}
					onMouseDown={handleTableMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
					onTouchStart={handleTableTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					onTouchCancel={handleTouchEnd}
				>
					<table className="w-full min-w-max table-fixed md:min-w-[960px] divide-y divide-gray-200 border border-gray-100">
						<thead>
							<tr>
								<th
									className="bg-[#840C4A] px-2 py-2 text-center border-r border-white/20 overflow-hidden"
									style={{
										width: "48px",
										minWidth: "48px",
										maxWidth: "48px",
									}}
								>
									<input
										type="checkbox"
										checked={isAllCurrentPageSelected}
										onChange={() => toggleSelectAllCurrentPage()}
										className="h-4 w-4 cursor-pointer"
									/>
								</th>
								{columnas?.map((columna, colIndex) => {
									const columnWidth =
										typeof columnWidths[colIndex] === "number"
											? columnWidths[colIndex]
											: 160;
									return (
										<th
											key={columna.field}
											onClick={() => handleOrdenarColumna(columna.field)}
											className={`relative px-2 py-2 bg-[#840C4A] text-[0.75rem] text-white font-medium tracking-wider text-center cursor-pointer select-none border-r border-white/20 last:border-r-0 ${
												columna.field === "acciones" ? "w-12 sm:w-16" : ""
											}`}
											style={{
												width: `${columnWidth}px`,
												minWidth: `${columnWidth}px`,
												maxWidth: `${columnWidth}px`,
											}}
										>
											<div className="whitespace-nowrap overflow-hidden text-ellipsis sm:whitespace-normal sm:break-words">
												{columna.title}
											</div>
											<span
												onMouseDown={(event) =>
													handleResizeStart(colIndex, event)
												}
												onTouchStart={(event) =>
													handleResizeStart(colIndex, event)
												}
												className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent transition-colors duration-150 hover:bg-white/60"
											/>
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody className="text-sm">
							{!hasRows ? (
								<tr>
									<td
										colSpan={(columnas?.length ?? 0) + 1}
										className="text-center py-4 text-gray-500 italic"
									>
										{t("ups_no_hay_nada_aqui")}
									</td>
								</tr>
							) : (
								paginatedRows.map((fila, rowIndex) => {
									const globalIndex =
										(Math.max(currentPage, 1) - 1) * pageSize + rowIndex;
									const rowId = rowIdAccessor(fila, globalIndex);
									return (
											<tr
												key={rowId}
												className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-100"}
											>
												<td
													className="px-2 py-1 text-center border-r border-gray-200 overflow-hidden"
													style={{
														width: "48px",
														minWidth: "48px",
														maxWidth: "48px",
													}}
											>
												<input
													type="checkbox"
													className="h-4 w-4 cursor-pointer"
													checked={isRowSelected(rowId)}
													onChange={() => toggleRowSelection(rowId)}
												/>
											</td>
											{columnas?.map((columna, colIndex) => {
												const columnWidth =
													typeof columnWidths[colIndex] === "number"
														? columnWidths[colIndex]
														: 160;
												const widthStyle = {
													width: `${columnWidth}px`,
													minWidth: `${columnWidth}px`,
													maxWidth: `${columnWidth}px`,
												};
													if (columna.field === "acciones") {
														return (
															<td
																key={`${rowId}-${columna.field}`}
																className="px-0 py-1 text-[0.75rem] text-gray-900 text-center border-r border-gray-200 last:border-r-0 overflow-hidden"
																style={widthStyle}
															>
																<div className="inline-flex items-center justify-center gap-2">
																{route !==
																	ROUTE_CONSTANTS.PROVISIONING_ROUTE && (
																	<Link href={`${route}/${fila.id}`}>
																		<FaPencilAlt className="text-gray-400 cursor-pointer text-center hover:text-gray-700" />
																	</Link>
																)}
																{route ===
																	ROUTE_CONSTANTS.PROVISIONING_ROUTE && (
																	<Link href={`${route}/${fila.id}`}>
																		<FaRocket
																			className="text-gray-400 cursor-pointer hover:text-gray-700"
																			title="Launch Token"
																		/>
																	</Link>
																)}

																{route === ROUTE_CONSTANTS.PROVISIONING_ROUTE &&
																	isAdminUser(session) && (
																		<Link
																			href={`${route}/${fila.id}?edit=true`}
																		>
																			<FaPencilAlt
																				className="text-gray-400 cursor-pointer hover:text-gray-700"
																				title="Edit Token"
																			/>
																		</Link>
																	)}
															</div>
														</td>
													);
												}

												const cellValue =
													columna.field === "created_at"
														? new Date(fila[columna.field]).toLocaleDateString(
																"es-AR"
														  )
														: fila[columna.field];
												const cellKey = `${rowId}-${columna.field}`;
												const isCopied = copiedCellKey === cellKey;
												const isCopyAllowed =
													!copyExcludedFieldSet.has(columna.field) &&
													cellValue != null &&
													cellValue !== "" &&
													!React.isValidElement(
														fila[columna.field]
													);

													return (
														<td
															key={cellKey}
															className="px-2 py-1 text-[0.9rem] text-gray-900 text-center border-r border-gray-200 last:border-r-0 overflow-hidden"
															style={widthStyle}
														>
															<div className="group flex w-full items-center justify-center gap-1">
																<span className="flex-1 truncate text-center">
																	{cellValue ?? "-"}
																</span>
																{isCopyAllowed && (
																	<button
																		type="button"
																		onClick={() =>
																			handleCopyValue(cellValue, cellKey)
																		}
																	className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
																	title={t("tabla_copiar", {
																		defaultValue: "Copiar contenido",
																		})}
																	>
																		{isCopied ? (
																			<FaCheck className="text-green-500" />
																		) : (
																			<FaRegCopy className="shrink-0" />
																		)}
																	</button>
																)}
															</div>
														</td>
												);
											})}
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			<div
				className={
					!showModal
						? "mt-4 ml-4 flex fixed bottom-4 left-1/2 transform -translate-x-1/2 translate-y-0 justify-center w-full"
						: "hidden"
				}
			>
				{renderbuttonsPages()}

				{route !== ROUTE_CONSTANTS.DETAIL_ROUTE &&
					route === ROUTE_CONSTANTS.PROVISIONING_ROUTE &&
					isAdminUser(session) && (
						<button
							className="mx-1 px-2 py-1 rounded bg-[#840C4A] text-white ml-4"
							onClick={() => router.push(tableRoutes[route]?.actionRoute)}
						>
							{t(tableRoutes[route]?.label)}
						</button>
					)}
			</div>
		</>
	);
};

export default Table;
