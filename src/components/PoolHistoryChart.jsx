import React, { useEffect, useMemo, useRef } from "react";
import {
	Chart,
	LineController,
	LineElement,
	PointElement,
	LinearScale,
	Legend,
	Tooltip,
} from "chart.js";

Chart.register(
	LineController,
	LineElement,
	PointElement,
	LinearScale,
	Legend,
	Tooltip
);

// ------- helpers -------
const toNumber = (value) => {
	if (value === null || value === undefined) return null;
	if (typeof value === "number") return Number.isFinite(value) ? value : null;
	if (typeof value === "string") {
		const parsed = Number(value.replace(/,/g, ""));
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
};

const toTimestamp = (value) => {
	if (value === null || value === undefined) return null;
	if (typeof value === "number") {
		if (!Number.isFinite(value)) return null;
		// si viene en segundos, pasamos a ms
		return value > 1e12 ? value : value * 1000;
	}
	if (typeof value === "string") {
		const parsed = Date.parse(value);
		return Number.isNaN(parsed) ? null : parsed;
	}
	return null;
};

const formatDateLabel = (timestamp) => {
	if (!timestamp) return "";
	const date = new Date(timestamp);
	return new Intl.DateTimeFormat(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
};

const formatAxisNumber = (value, decimals = 2) => {
	if (value === null || value === undefined) return "";
	const numeric = Number(value);
	if (!Number.isFinite(numeric)) return "";
	return numeric.toLocaleString(undefined, {
		maximumFractionDigits: decimals,
	});
};

const WETH_ADDRESSES = new Set([
	"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase(), // Ethereum
	"0x4200000000000000000000000000000000000006".toLowerCase(), // Base
]);

const genericSymbolPattern = /^token\d*$/i;

const resolveTokenSymbol = (
	tokenMeta = {},
	fallbackAddress,
	preferredSymbol
) => {
	const rawSymbol = tokenMeta.symbol?.trim();
	const rawName = tokenMeta.name?.trim();
	const preferred = preferredSymbol?.trim();
	const addressLower =
		tokenMeta.address?.toLowerCase() ?? fallbackAddress?.toLowerCase() ?? "";

	if (addressLower && WETH_ADDRESSES.has(addressLower)) return "WETH";

	const candidates = [preferred, rawSymbol, rawName].filter(
		(v) => v && !genericSymbolPattern.test(v)
	);
	if (candidates.length > 0) return candidates[0];

	if (addressLower)
		return `${addressLower.slice(0, 4)}…${addressLower.slice(-4)}`;
	return "Token";
};

// ------- component -------
const PoolHistoryChart = ({ pairHistory, tokenAddress, tokenSymbol }) => {
	const canvasRef = useRef(null);
	const chartRef = useRef(null);

	const {
		points: dataset,
		minTimestamp,
		maxTimestamp,
		tokenIsToken0,
		baseReserveSeries,
		pairReserveSeries,
	} = useMemo(() => {
		const syncs = Array.isArray(pairHistory?.events?.syncs)
			? pairHistory.events.syncs
			: [];

		if (syncs.length === 0) {
			return {
				points: [],
				minTimestamp: null,
				maxTimestamp: null,
				tokenIsToken0: true,
				baseReserveSeries: [],
				pairReserveSeries: [],
			};
		}

		const token0Address = pairHistory?.pair?.token0?.address?.toLowerCase();
		const targetToken = tokenAddress?.toLowerCase() ?? null;
		const tokenIsToken0 =
			token0Address && targetToken ? token0Address === targetToken : true;

		// Puntos desde los SYNCs
		const points = syncs
			.map((entry) => {
				const reserve0 = toNumber(
					entry.reserve0Formatted ??
						entry.reserve0 ??
						entry.reserve0Raw ??
						entry.reserve0Wei
				);
				const reserve1 = toNumber(
					entry.reserve1Formatted ??
						entry.reserve1 ??
						entry.reserve1Raw ??
						entry.reserve1Wei
				);
				const timestamp =
					toTimestamp(
						entry.timestamp ??
							entry.blockTimestamp ??
							entry.isoDate ??
							entry.date
					) ?? null;

				if (!reserve0 || !reserve1 || !timestamp) return null;

				const price = tokenIsToken0 ? reserve1 / reserve0 : reserve0 / reserve1;

				return Number.isFinite(price)
					? { timestamp, price, reserve0, reserve1 }
					: null;
			})
			.filter(Boolean)
			.sort((a, b) => a.timestamp - b.timestamp);

		// ------ Punto “actual” desde summary ------
		const summary = pairHistory?.summary ?? {};
		const current =
			summary.currentReserves ?? pairHistory?.pair?.currentReserves ?? null;

		// preferimos latestIsoDate / latestReadableDate / latestBlockTimestamp
		const latestTs =
			toTimestamp(summary.latestIsoDate) ??
			toTimestamp(summary.latestReadableDate) ??
			toTimestamp(summary.latestBlockTimestamp);

		if (current && latestTs) {
			const r0 = toNumber(
				current.reserve0Formatted ??
					current.reserve0 ??
					current.reserve0Raw ??
					current.reserve0Wei
			);
			const r1 = toNumber(
				current.reserve1Formatted ??
					current.reserve1 ??
					current.reserve1Raw ??
					current.reserve1Wei
			);
			if (r0 && r1) {
				const priceNow = tokenIsToken0 ? r1 / r0 : r0 / r1;
				const lastT = points.length ? points[points.length - 1].timestamp : 0;
				// Agregamos solo si es posterior al último sync
				if (Number.isFinite(priceNow) && latestTs > lastT) {
					points.push({
						timestamp: latestTs,
						price: priceNow,
						reserve0: r0,
						reserve1: r1,
					});
				}
			}
		}

		// Series (reservas) y normalización para compartir eje
		const baseReserveSeriesRaw = points.map((p) => ({
			x: p.timestamp,
			y: p.reserve1,
		}));
		const pairReserveSeriesRaw = points.map((p) => ({
			x: p.timestamp,
			y: p.reserve0,
		}));

		const smoothSeries = (series) => {
			if (series.length <= 1) return series;
			const values = series.map((s) => s.y).filter((v) => Number.isFinite(v));
			if (values.length === 0) return series;
			const maxValue = Math.max(...values.map(Math.abs));
			if (maxValue === 0) return series;
			const scaleFactor = 1 / maxValue;
			return series.map((s) => ({
				x: s.x,
				y: s.y * scaleFactor,
				scaledOriginal: s.y,
			}));
		};

		const baseReserveSeries = smoothSeries(baseReserveSeriesRaw);
		const pairReserveSeries = smoothSeries(pairReserveSeriesRaw);

		const min = points.length > 0 ? points[0].timestamp : null;
		// Usamos latestTs si existe, así el eje llega hasta el último bloque conocido
		const max =
			points.length > 0
				? latestTs ?? points[points.length - 1].timestamp
				: null;

		return {
			points,
			minTimestamp: min,
			maxTimestamp: max,
			tokenIsToken0,
			baseReserveSeries,
			pairReserveSeries,
		};
	}, [pairHistory, tokenAddress]);

	const token0Symbol = resolveTokenSymbol(
		pairHistory?.pair?.token0,
		pairHistory?.pair?.token0?.address,
		tokenIsToken0 ? tokenSymbol : undefined
	);
	const token1Symbol = resolveTokenSymbol(
		pairHistory?.pair?.token1,
		pairHistory?.pair?.token1?.address,
		!tokenIsToken0 ? tokenSymbol : undefined
	);

	const primarySymbol = tokenIsToken0 ? token0Symbol : token1Symbol;
	const baseSymbol = tokenIsToken0 ? token1Symbol : token0Symbol;
	const priceLabel = `Precio (${baseSymbol}/${primarySymbol})`;
	const reservePrimaryLabel = `Reserva ${primarySymbol}`;
	const reserveBaseLabel = `Reserva ${baseSymbol}`;

	useEffect(() => {
		if (!canvasRef.current) return;

		if (!dataset || dataset.length === 0) {
			if (chartRef.current) {
				chartRef.current.destroy();
				chartRef.current = null;
			}
			return;
		}

		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		if (chartRef.current) {
			chartRef.current.destroy();
			chartRef.current = null;
		}

		chartRef.current = new Chart(ctx, {
			type: "line",
			data: {
				datasets: [
					{
						label: priceLabel,
						parsing: false,
						data: dataset.map((d) => ({ x: d.timestamp, y: d.price })),
						borderColor: "#3b82f6",
						backgroundColor: "rgba(59, 130, 246, 0.15)",
						yAxisID: "y",
						pointRadius: 0,
						tension: 0.2,
						spanGaps: true,
					},
					{
						label: reservePrimaryLabel,
						parsing: false,
						data: pairReserveSeries,
						borderColor: "#10b981",
						backgroundColor: "rgba(16, 185, 129, 0.2)",
						yAxisID: "y1",
						pointRadius: 0,
						tension: 0.2,
						spanGaps: true,
					},
					{
						label: reserveBaseLabel,
						parsing: false,
						data: baseReserveSeries,
						borderColor: "#f59e0b",
						backgroundColor: "rgba(245, 158, 11, 0.2)",
						yAxisID: "y1",
						pointRadius: 0,
						tension: 0.2,
						spanGaps: true,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				normalized: true,
				interaction: { mode: "index", intersect: false },
				plugins: {
					legend: { display: true, position: "bottom" },
					tooltip: {
						callbacks: {
							title: (items) =>
								items?.[0]?.parsed?.x ? formatDateLabel(items[0].parsed.x) : "",
							label: (item) => {
								const decimals = item.dataset.yAxisID === "y" ? 6 : 2;
								const raw =
									item.raw && item.raw.scaledOriginal != null
										? item.raw.scaledOriginal
										: item.parsed.y;
								const formatted = formatAxisNumber(raw, decimals);
								return `${item.dataset.label}: ${formatted}`;
							},
						},
					},
				},
				scales: {
					x: {
						type: "linear",
						position: "bottom",
						min: minTimestamp ?? undefined,
						max: maxTimestamp ?? undefined,
						ticks: {
							callback: (val) => formatDateLabel(val),
							maxTicksLimit: 8,
						},
						title: { display: true, text: "Fecha" },
					},
					y: {
						type: "linear",
						display: true,
						position: "left",
						title: { display: true, text: priceLabel },
						grid: { drawOnChartArea: false, drawTicks: false },
						ticks: { display: false },
					},
					y1: {
						type: "linear",
						display: true,
						position: "right",
						title: { display: true, text: "Reservas" },
						grid: { drawOnChartArea: false, drawTicks: false },
						ticks: { display: false },
					},
				},
			},
		});

		return () => {
			if (chartRef.current) {
				chartRef.current.destroy();
				chartRef.current = null;
			}
		};
	}, [
		dataset,
		pairReserveSeries,
		baseReserveSeries,
		priceLabel,
		reservePrimaryLabel,
		reserveBaseLabel,
		minTimestamp,
		maxTimestamp,
	]);

	if (!dataset || dataset.length === 0) {
		return (
			<div className="w-full rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
				No hay datos suficientes de reservas para mostrar el gráfico.
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden">
			<div className="mx-auto max-w-5xl rounded-lg border border-slate-200 p-4">
				<h3 className="mb-4 text-base font-semibold text-slate-700">
					Historial de precio y reservas del pool
				</h3>
				<div className="h-[26rem]">
					<canvas ref={canvasRef} />
				</div>
			</div>
		</div>
	);
};

export default PoolHistoryChart;
