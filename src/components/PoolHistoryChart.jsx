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

const toNumber = (value) => {
	if (value === null || value === undefined) return null;
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : null;
	}
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
	"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase(), // Ethereum mainnet
	"0x4200000000000000000000000000000000000006".toLowerCase(), // Base
]);

const genericSymbolPattern = /^token\d*$/i;

const resolveTokenSymbol = (tokenMeta = {}, fallbackAddress, preferredSymbol) => {
	const rawSymbol = tokenMeta.symbol?.trim();
	const rawName = tokenMeta.name?.trim();
	const preferred = preferredSymbol?.trim();
	const addressLower =
		tokenMeta.address?.toLowerCase() ?? fallbackAddress?.toLowerCase() ?? "";

	if (addressLower && WETH_ADDRESSES.has(addressLower)) {
		return "WETH";
	}

	const candidates = [preferred, rawSymbol, rawName].filter(
		(value) => value && !genericSymbolPattern.test(value)
	);
	if (candidates.length > 0) {
		return candidates[0];
	}

	if (addressLower) {
		return `${addressLower.slice(0, 4)}…${addressLower.slice(-4)}`;
	}

	return "Token";
};

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
        const tokenIsToken0 = token0Address && targetToken
            ? token0Address === targetToken
            : true;

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

				const price = tokenIsToken0
					? reserve1 / reserve0
					: reserve0 / reserve1;

				return Number.isFinite(price)
					? {
							timestamp,
							price,
							reserve0,
							reserve1,
					  }
					: null;
			})
			.filter(Boolean)
			.sort((a, b) => a.timestamp - b.timestamp);

	const baseReserveSeriesRaw = points.map((entry) => ({
		x: entry.timestamp,
		y: entry.reserve1,
	}));
	const pairReserveSeriesRaw = points.map((entry) => ({
		x: entry.timestamp,
		y: entry.reserve0,
	}));

	const smoothSeries = (series) => {
		if (series.length <= 1) return series;
		const values = series.map((item) => item.y).filter((v) => Number.isFinite(v));
		if (values.length === 0) return series;
		const maxValue = Math.max(...values.map(Math.abs));
		if (maxValue === 0) return series;
		const scaleFactor = 1 / maxValue;
		return series.map((item) => ({
			x: item.x,
			y: item.y * scaleFactor,
			scaledOriginal: item.y,
		}));
	};

	const baseReserveSeries = smoothSeries(baseReserveSeriesRaw);
	const pairReserveSeries = smoothSeries(pairReserveSeriesRaw);

		const min = points.length > 0 ? points[0].timestamp : null;
		const max =
			points.length > 0
				? Math.max(points[points.length - 1].timestamp, Date.now())
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

	const priceLabel = tokenIsToken0
		? `Precio (${token1Symbol}/${token0Symbol})`
		: `Precio (${token0Symbol}/${token1Symbol})`;
	const reserve0Label = `Reserva ${token0Symbol}`;
	const reserve1Label = `Reserva ${token1Symbol}`;

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
						data: dataset.map((entry) => ({
							x: entry.timestamp,
							y: entry.price,
						})),
						borderColor: "#3b82f6",
						backgroundColor: "rgba(59, 130, 246, 0.15)",
						yAxisID: "y",
						pointRadius: 0,
						tension: 0.2,
						spanGaps: true,
					},
					{
						label: reserve0Label,
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
						label: reserve1Label,
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
				interaction: {
					mode: "index",
					intersect: false,
				},
				plugins: {
					legend: {
						display: true,
						position: "bottom",
					},
					tooltip: {
						callbacks: {
							title: (items) =>
								items?.[0]?.parsed?.x
									? formatDateLabel(items[0].parsed.x)
									: "",
							label: (item) => {
								const decimals = item.dataset.yAxisID === "y" ? 6 : 2;
								const rawValue = item.raw?.scaledOriginal ?? item.parsed.y;
								const formatted = formatAxisNumber(rawValue, decimals);
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
							callback: (value) => formatDateLabel(value),
							maxTicksLimit: 8,
						},
						title: {
							display: true,
							text: "Fecha",
						},
					},
					y: {
						type: "linear",
						display: true,
						position: "left",
						title: {
							display: true,
							text: priceLabel,
						},
						grid: {
							drawOnChartArea: false,
							drawTicks: false,
						},
						ticks: {
							display: false,
						},
					},
					y1: {
						type: "linear",
						display: true,
						position: "right",
						title: {
							display: true,
							text: "Reservas",
						},
						grid: {
							drawOnChartArea: false,
							drawTicks: false,
						},
						ticks: {
							display: false,
						},
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
		reserve0Label,
		reserve1Label,
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
