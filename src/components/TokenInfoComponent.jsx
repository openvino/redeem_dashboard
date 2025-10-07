import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { VCOPrices, contracts, NETWORK_CONFIG } from "../../contracts";
import PoolHistoryChart from "./PoolHistoryChart";

const TokenInfoComponent = ({
	tokenInfo,
	onSelectChange,
	style,
	selectedContractAddress,
	pairHistory,
}) => {
	const { t } = useTranslation();

	const {
		name,
		symbol,
		vcoIssuance,
		totalSupply,
		burnedTokens,
		holdersCount,
		totalTransfers,
		tokenContract,
		uniswapUri,
		crowdsaleAddress,
		lpContractAddress,
		address,
		price,
		holdersUrl,
		displayName,
		network,
		networkLabel,
		archived,
		tokensToBurn,
		vcoSourceNetworkLabel,
	} = tokenInfo;

	const availableSupply = useMemo(() => {
		const supply = Number(totalSupply) || 0;
		const pendingBurn = Number(tokensToBurn) || 0;
		if (pendingBurn <= 0) return supply;
		return Math.max(supply - pendingBurn, 0);
	}, [totalSupply, tokensToBurn]);

	const [sales, setSales] = useState([]);
	const [loadingSales, setLoadingSales] = useState(false);
	const [fiatPrice, setFiatPrice] = useState({ ars: null, usd: null });
	const [rangeStart, setRangeStart] = useState("");
	const [rangeEnd, setRangeEnd] = useState("");
	const [rangeResult, setRangeResult] = useState(null);
	const [year, setYear] = useState("");
	const [yearResult, setYearResult] = useState(null);

	const [salesPage, setSalesPage] = useState(1);
	const [salesPageSize, setSalesPageSize] = useState(25);
	const [wineryFilter, setWineryFilter] = useState("");

	const sumAmounts = (rows = []) =>
		rows.reduce((acc, r) => acc + Number(r.amount || 0), 0);

	const fetchSalesByRange = async ({ from, to, winery }) => {
		const params = {};
		if (from) params.from = from;
		if (to) params.to = to;
		if (winery) params.winery = winery;
		if (tokenInfo?.address) params.token = tokenInfo.address;
		const res = await axios.get("/api/routes/salesRoute", { params });
		return res.data?.sales || res.data?.rows || [];
	};

	const fetchSalesByYear = async ({ year, winery }) => {
		const from = `${year}-01-01`;
		const to = `${year}-12-31`;
		return fetchSalesByRange({ from, to, winery });
	};

	const totalSalesRows = sales.length;
	const totalSalesPages = Math.max(
		1,
		Math.ceil(totalSalesRows / salesPageSize)
	);

	const pagedSales = useMemo(() => {
		const start = (salesPage - 1) * salesPageSize;
		const end = start + salesPageSize;
		return sales.slice(start, end);
	}, [sales, salesPage, salesPageSize]);

	useEffect(() => {
		if (salesPage > totalSalesPages) setSalesPage(totalSalesPages);
	}, [totalSalesPages, salesPage]);

	const vcoData = useMemo(
		() =>
			VCOPrices.find((entry) => entry.name === name || entry.symbol === symbol),
		[name, symbol]
	);

	useEffect(() => {
		if (!vcoData?.priceEth) {
			setFiatPrice({ ars: null, usd: null });
			return;
		}
		const fetchFiatReference = async () => {
			try {
				const [ethUsd, usdArs] = await Promise.all([
					axios.get("https://criptoya.com/api/bitsoalpha/eth/usd"),
					axios.get("https://criptoya.com/api/argenbtc/usdt/ars"),
				]);
				if (ethUsd.data?.totalAsk && usdArs.data?.ask) {
					const priceUsd = Number(ethUsd.data.totalAsk) * vcoData.priceEth;
					const priceArs = priceUsd * Number(usdArs.data.ask);
					setFiatPrice({ usd: priceUsd, ars: priceArs });
				}
			} catch (error) {
				console.error("No se pudo actualizar la referencia fiat", error);
				setFiatPrice({ ars: null, usd: null });
			}
		};
		fetchFiatReference();
	}, [vcoData]);

	const formatNumber = (value) => {
		if (value === undefined || value === null) return "—";
		const numericValue = Number(value);
		if (Number.isFinite(numericValue)) {
			return numericValue.toLocaleString(undefined, {
				maximumFractionDigits: 2,
			});
		}
		return value;
	};

	const handleRangeSubmit = async (event) => {
		event.preventDefault();
		if (!rangeStart || !rangeEnd) {
			setRangeResult(null);
			return;
		}
		try {
			setLoadingSales(true);
			const rows = await fetchSalesByRange({
				from: rangeStart,
				to: rangeEnd,
				winery: wineryFilter || undefined,
			});
			const total = sumAmounts(rows);
			setSales(rows);
			setSalesPage(1);
			setRangeResult(total);
		} catch (error) {
			console.error("Error al consultar ventas por rango", error);
			setRangeResult(null);
		} finally {
			setLoadingSales(false);
		}
	};

	const handleYearChange = async (event) => {
		const selectedYear = event.target.value;
		setYear(selectedYear);

		if (!selectedYear) {
			setYearResult(null);
			return;
		}

		const from = `${selectedYear}-01-01`;
		const to = `${selectedYear}-12-31`;
		setRangeStart(from);
		setRangeEnd(to);

		try {
			setLoadingSales(true);
			const rows = await fetchSalesByRange({
				from,
				to,
				winery: wineryFilter || undefined,
			});
			const total = sumAmounts(rows);
			setSales(rows);
			setSalesPage(1);
			setYearResult(total);
			setRangeResult(total);
		} catch (error) {
			console.error("Error al consultar ventas por año", error);
			setYearResult(null);
		} finally {
			setLoadingSales(false);
		}
	};

	const logoSrc = symbol ? `/assets/${symbol}.png` : "/assets/default.png";
	const explorerBaseUrl =
		network && NETWORK_CONFIG[network]?.explorer
			? NETWORK_CONFIG[network].explorer
			: NETWORK_CONFIG.base.explorer;
	const getExplorerUrl = (addr) =>
		addr ? `${explorerBaseUrl}/address/${addr}` : null;
	const title = displayName || name;
	const networkDisplay = networkLabel || network;
	const archivedLabel = archived ? t("archived_token") || "Archive" : null;
	const isEthereumNetwork = network === NETWORK_CONFIG.ethereum.key;
	const showUniswapButton = Boolean(uniswapUri && !isEthereumNetwork);
	const vcoPriceLabel = vcoSourceNetworkLabel
		? `${t("vco_price")} (${vcoSourceNetworkLabel})`
		: t("vco_price");

	return (
		<div
			style={style}
			className="w-full bg-[#F1EDE2] rounded-xl p-6 flex flex-col gap-6"
		>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Image
						src={logoSrc}
						width={96}
						height={96}
						alt={`${symbol} logo`}
						className="w-20 h-20 object-contain"
					/>
					<div>
						<h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
						<p className="text-gray-600 uppercase tracking-wide">{symbol}</p>
						{networkDisplay && (
							<span className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 uppercase">
								{networkDisplay}
								{archivedLabel ? `• ${archivedLabel}` : ""}
							</span>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					<label htmlFor="token-select" className="text-sm text-gray-600">
						{t("select_token")}
					</label>
					<select
						id="token-select"
						value={selectedContractAddress ?? tokenContract ?? ""}
						onChange={onSelectChange}
						className="border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none"
					>
						<option value="">{t("select_token")}</option>
						{contracts.map((entry) => (
							<option
								key={entry.contractAddress}
								value={entry.contractAddress}
								name={entry.contractPairAddress}
							>
								{entry.displayName || entry.name}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
				{[
					{ label: t("token_issuance"), value: availableSupply },
					{
						label: t("bottles_remaining"),
						value: archived ? totalSupply : availableSupply,
					},
					{ label: t("burned_tokens"), value: burnedTokens },
					!archived && tokensToBurn !== null && tokensToBurn !== undefined
						? { label: t("tokens_to_burn"), value: tokensToBurn }
						: null,
				]
					.filter(Boolean)
					.map((card) => (
						<div
							key={card.label}
							className="bg-white/70 rounded-lg p-4 shadow-sm flex flex-col gap-1"
						>
							<span className="text-xs uppercase text-gray-500">
								{card.label}
							</span>
							<span className="text-xl font-semibold text-gray-900">
								{formatNumber(card.value)}
							</span>
						</div>
					))}
				{holdersUrl && (
					<div className="bg-white/70 rounded-lg p-4 shadow-sm flex flex-col gap-1">
						<span className="text-xs uppercase text-gray-500">
							{t("holders")}
						</span>
						<Link
							href={holdersUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-[#840C4A] underline"
						>
							{t("holders_wallets") || "Wallets de holders"}
						</Link>
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white/70 rounded-lg p-4 shadow-sm space-y-3">
					<h2 className="text-lg font-semibold text-gray-900">{t("price")}</h2>
					<p className="text-sm text-gray-600">
						{t("price_eth") || "Precio actual (ETH)"}:{" "}
						<span className="font-semibold text-gray-900">
							{price && price > 0 ? price.toFixed(6) : "—"}
						</span>
					</p>
					<p className="text-sm text-gray-600">
						{vcoPriceLabel}:{" "}
						<span className="font-semibold text-gray-900">
							{vcoData?.priceEth ? `${vcoData.priceEth} ETH` : "—"}
						</span>
					</p>
					<p className="text-sm text-gray-600">
						{t("vco_price_fiat")}:{" "}
						<span className="font-semibold text-gray-900">
							{fiatPrice.usd && fiatPrice.ars
								? `${fiatPrice.usd.toFixed(2)} USD / ${fiatPrice.ars.toFixed(
										2
								  )} ARS`
								: vcoData
								? `${vcoData.priceUsd} USD / ${vcoData.priceArs} ARS`
								: "—"}
						</span>
					</p>
					<p className="text-sm text-gray-600">
						{t("total_transfers")}:{" "}
						<span className="font-semibold text-gray-900">
							{formatNumber(totalTransfers)}
						</span>
					</p>
				</div>

				<div className="bg-white/70 rounded-lg p-4 shadow-sm space-y-3">
					<h2 className="text-lg font-semibold text-gray-900">
						{t("vco_info") || "Información VCO"}
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
						<div>
							<span className="uppercase text-xs text-gray-500 block">
								{t("vco_start")}
							</span>
							<span className="font-semibold text-gray-900">
								{vcoData?.dateStart ?? "—"}
							</span>
						</div>
						<div>
							<span className="uppercase text-xs text-gray-500 block">
								{t("vco_end")}
							</span>
							<span className="font-semibold text-gray-900">
								{vcoData?.dateEnd ?? "—"}
							</span>
						</div>
						<div>
							<span className="uppercase text-xs text-gray-500 block">
								{t("token_issuance")}
							</span>
							<span className="font-semibold text-gray-900">
								{formatNumber(vcoIssuance)}
							</span>
						</div>
						{vcoSourceNetworkLabel && (
							<div>
								<span className="uppercase text-xs text-gray-500 block">
									{t("network") || "Network"}
								</span>
								<span className="font-semibold text-gray-900">
									{vcoSourceNetworkLabel}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{pairHistory && (
		<PoolHistoryChart
			pairHistory={pairHistory}
			tokenAddress={tokenContract || address}
			tokenSymbol={symbol || displayName}
		/>
	)}

			<div className="bg-white/70 rounded-lg p-4 shadow-sm">
				<h2 className="text-lg font-semibold text-gray-900 mb-3">
					{t("addresses") || "Direcciones"}
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
					{[
						{
							label: t("network") || "Network",
							value: networkDisplay,
							href: null,
						},
						{
							label: t("contract_address"),
							value: address,
							href: getExplorerUrl(address),
						},
						{
							label: t("crowdsale_address"),
							value: crowdsaleAddress,
							href: getExplorerUrl(crowdsaleAddress),
						},
						{
							label: t("lp"),
							value: lpContractAddress,
							href: getExplorerUrl(lpContractAddress),
						},
					]
						.filter((card) => card.value)
						.map((card) => (
							<div
								key={`${card.label}-${card.value}`}
								className="flex flex-col gap-1"
							>
								<span className="text-xs uppercase text-gray-500">
									{card.label}
								</span>
								<span className="font-mono break-all text-gray-900">
									{card.href ? (
										<Link
											href={card.href}
											target="_blank"
											rel="noopener noreferrer"
											className="text-[#840C4A] underline"
										>
											{card.value}
										</Link>
									) : (
										card.value ?? "—"
									)}
								</span>
							</div>
						))}
				</div>
				{/* {showUniswapButton && (
						<div className="mt-4">
							<Link href={uniswapUri} target="_blank" rel="noopener noreferrer">
							<button className="px-4 py-2 bg-[#840C4A] text-white rounded-lg text-sm">
								Uniswap
							</button>
						</Link>
					</div>
				)} */}
			</div>

			{/* <div className="bg-white/70 rounded-lg p-4 shadow-sm space-y-4">
				<h2 className="text-lg font-semibold text-gray-900">
					{t("sales_sumary")}
				</h2>

				<form
					onSubmit={handleRangeSubmit}
					className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700"
				>
					<label className="flex flex-col gap-1">
						<span className="text-xs uppercase text-gray-500">
							{t("from") || "Desde"}
						</span>
						<input
							type="date"
							value={rangeStart}
							onChange={(e) => {
								setRangeStart(e.target.value);
								setYear("---");
								setYearResult(null);
							}}
							className="border rounded px-2 py-2 focus:outline-none"
						/>
					</label>
					<label className="flex flex-col gap-1">
						<span className="text-xs uppercase text-gray-500">
							{t("to") || "Hasta"}
						</span>
						<input
							type="date"
							value={rangeEnd}
							onChange={(e) => {
								setRangeEnd(e.target.value);
								setYear("---");
								setYearResult(null);
							}}
							className="border rounded px-2 py-2 focus:outline-none"
						/>
					</label>
					<label className="flex flex-col gap-1 sm:col-span-2">
						<span className="text-xs uppercase text-gray-500">
							{t("winery") || "Bodega (opcional)"}
						</span>
						<input
							type="text"
							value={wineryFilter}
							onChange={(e) => setWineryFilter(e.target.value)}
							className="border rounded px-2 py-2 focus:outline-none"
							placeholder={t("winery") || "Bodega"}
						/>
					</label>
					<div className="sm:col-span-2 flex flex-wrap gap-2">
						<button
							type="submit"
							className="px-3 py-2 bg-[#840C4A] text-white rounded text-sm"
						>
							{t("calculate") || "Calcular"}
						</button>
						<button
							type="button"
							onClick={() => {
								setRangeStart("");
								setRangeEnd("");
								setRangeResult(null);
								setSales([]);
							}}
							className="px-3 py-2 border border-[#840C4A] text-[#840C4A] rounded text-sm"
						>
							{t("clear") || "Limpiar"}
						</button>
					</div>
					<div className="sm:col-span-2 text-sm text-gray-600">
						{loadingSales && <span className="mr-2">Cargando…</span>}
						{rangeResult !== null
							? `${
									t("tokens_sold_between") || "Tokens vendidos"
							  }: ${formatNumber(rangeResult)}`
							: t("select_date_range") || "Seleccioná un rango para consultar"}
						{sales?.length ? (
							<span className="ml-2 text-gray-500">({sales.length} filas)</span>
						) : null}
					</div>
				</form>

				<div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
					<label
						htmlFor="year-query"
						className="text-xs uppercase text-gray-500"
					>
						{t("year") || "Año"}
					</label>
					<input
						id="year-query"
						type="number"
						min="2000"
						max="2100"
						value={year}
						onChange={async (event) => {
							const nextYear = event.target.value;
							setYear(nextYear);
							if (!nextYear) {
								setYearResult(null);
								return;
							}
							try {
								setLoadingSales(true);
								const rows = await fetchSalesByYear({
									year: nextYear,
									winery: wineryFilter || undefined,
								});
								const total = sumAmounts(rows);
								setSales(rows);
								setSalesPage(1);
								setYearResult(total);
							} catch (error) {
								console.error("Error al consultar ventas por año", error);
								setYearResult(null);
							} finally {
								setLoadingSales(false);
							}
						}}
						className="border rounded px-2 py-2 focus:outline-none w-28"
						placeholder="YYYY"
					/>
					<span>
						{year === "---"
							? "---"
							: yearResult !== null
							? `${formatNumber(yearResult)} ${t("tokens") || "tokens"}`
							: t("select_year") || "Elegí un año"}
						{sales?.length ? (
							<span className="text-gray-500"> · {sales.length} filas</span>
						) : null}
					</span>
				</div>

				<div className="bg-white/60 rounded-lg p-3 border border-gray-200">
					<div className="flex items-center justify-between mb-2 text-sm">
						<div>
							{totalSalesRows
								? `Mostrando ${Math.min(
										(salesPage - 1) * salesPageSize + 1,
										totalSalesRows
								  )}–${Math.min(
										salesPage * salesPageSize,
										totalSalesRows
								  )} de ${totalSalesRows} ventas`
								: "Sin resultados"}
						</div>
						<div className="flex items-center gap-2">
							<span className="text-gray-500">Filas por página</span>
							<select
								value={salesPageSize}
								onChange={(e) => {
									setSalesPageSize(Number(e.target.value));
									setSalesPage(1);
								}}
								className="border rounded px-2 py-1"
							>
								{[10, 25, 50, 100].map((n) => (
									<option key={n} value={n}>
										{n}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full text-sm text-left">
							<thead className="uppercase text-xs text-gray-500">
								<tr>
									<th className="py-2 pr-4">Fecha</th>
									<th className="py-2 pr-4">Wallet</th>
									<th className="py-2 pr-4">Cantidad</th>
									<th className="py-2 pr-4">Bodega</th>
									<th className="py-2">Token</th>
								</tr>
							</thead>
							<tbody>
								{pagedSales.length ? (
									pagedSales.map((r) => (
										<tr
											key={
												r.id ?? `${r.customer_id || r.wallet}-${r.created_at}`
											}
											className="border-t border-gray-200"
										>
											<td className="py-2 pr-4">
												{new Date(r.created_at).toLocaleString()}
											</td>
											<td className="py-2 pr-4 font-mono break-all">
												{r.customer_id || r.wallet}
											</td>
											<td className="py-2 pr-4">{formatNumber(r.amount)}</td>
											<td className="py-2 pr-4">
												{r.winerie_id || r.winery_id || r.winery || "—"}
											</td>
											<td className="py-2">
												{r.token_symbol || r.token || symbol || "—"}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={5} className="py-4 text-center text-gray-500">
											{loadingSales
												? "Cargando ventas…"
												: "No hay ventas para mostrar"}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					<div className="mt-3 flex items-center justify-between text-sm">
						<div className="text-gray-600">
							{t("page") || "Página"} {salesPage} {t("of") || "de"}{" "}
							{totalSalesPages}
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setSalesPage((p) => Math.max(1, p - 1))}
								disabled={salesPage === 1}
								className="px-3 py-1 rounded border disabled:opacity-50"
							>
								{t("previous") || "Anterior"}
							</button>
							<button
								type="button"
								onClick={() =>
									setSalesPage((p) => Math.min(totalSalesPages, p + 1))
								}
								disabled={salesPage === totalSalesPages}
								className="px-3 py-1 rounded border disabled:opacity-50"
							>
								{t("next") || "Siguiente"}
							</button>
						</div>
					</div>
				</div>
			</div> */}
		</div>
	);
};

export default TokenInfoComponent;
