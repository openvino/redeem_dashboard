import React from "react";
import Link from "next/link";
import { FaPencilAlt } from "react-icons/fa";
import {
	MdSkipNext,
	MdSkipPrevious,
	MdNavigateNext,
	MdNavigateBefore,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { ROUTE_CONSTANTS, tableRoutes } from "@/utils/tableUtils";
import { useTable } from "@/hooks/useTable";

const Table = ({ data, columnas, n, route = "/detail" }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const showModal = useSelector((state) => state.notification.showModal);

	const {
		tooltip,
		handleMouseEnter,
		handleMouseLeave,
		handleClickTooltip,
		handleShowTooltip,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		currentPage,
		renderbuttonsPages,
		orderPagedData,
		handleOrdenarColumna,
	} = useTable(data, n);

	return (
		<>
			<div
				className="overflow-hidden cursor-grab"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				style={{ userSelect: "none" }}
			>
				<table className="w-full divide-y divide-gray-200 border border-gray-100">
					<thead>
						<tr>
							{columnas.map((columna) => (
								<th
									key={columna.field}
									onClick={() => handleOrdenarColumna(columna.field)}
									className={`px-2 py-2 bg-[#840C4A] text-[0.75rem] text-white font-medium tracking-wider text-center cursor-pointer ${
										columna.field === "acciones" ? "w-12 sm:w-16" : ""
									}`}
									style={{ maxWidth: "5rem" }}
								>
									<div className="whitespace-nowrap overflow-hidden text-ellipsis sm:whitespace-normal sm:break-words">
										{columna.title}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody className="text-sm">
						{orderPagedData().map((fila, index) => (
							<tr
								key={index}
								className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
							>
								{columnas.map((columna) => {
									if (columna.field === "acciones") {
										return (
											<td
												key={columna.field}
												className="px-0 py-1 text-[0.75rem] text-gray-900 text-center"
											>
												<Link href={`${route}/${fila.id}`}>
													<div className="inline-flex items-center px-0">
														<FaPencilAlt className="text-gray-400 cursor-pointer text-center hover:text-gray-700" />
													</div>
												</Link>
											</td>
										);
									}
									return (
										<td
											key={columna.field}
											className="px-2 py-1 text-[0.9rem] text-gray-900 text-center"
											style={{
												maxWidth: "5rem",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
											onMouseEnter={(e) =>
												handleMouseEnter(fila[columna.field], e)
											}
											onMouseLeave={handleMouseLeave}
										>
											<div>
												{columna.field === "created_at"
													? new Date(fila[columna.field]).toLocaleDateString(
															"es-AR"
													  )
													: fila[columna.field]}
											</div>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{tooltip.visible && tooltip.content && (
				<div
					className="absolute bg-white border border-gray-300 px-4 py-2 shadow-lg z-50"
					style={{ top: tooltip.y, left: tooltip.x }}
					onMouseEnter={handleShowTooltip}
					onMouseLeave={handleMouseLeave}
					onClick={() => handleClickTooltip(tooltip.content)}
				>
					{tooltip.content}
				</div>
			)}

			<div
				className={
					!showModal
						? "mt-4 ml-4 flex fixed bottom-4 left-1/2 transform -translate-x-1/2 translate-y-0 justify-center w-full"
						: "hidden"
				}
			>
				{renderbuttonsPages()}

				{route !== ROUTE_CONSTANTS.DETAIL_ROUTE && (
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
