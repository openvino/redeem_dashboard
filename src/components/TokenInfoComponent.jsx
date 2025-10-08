import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { VCOPrices, contracts, NETWORK_CONFIG } from "../../contracts";
import PoolHistoryChart from "./PoolHistoryChart";

const norm = (s) =>
	(s || "")
		.toString()
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "");
const pickVcoRow = ({ name, displayName, symbol }) => {
	const keys = [displayName, name, symbol].map(norm).filter(Boolean);

	let row =
		VCOPrices.find((e) => {
			const n = norm(e.name);
			const s = norm(e.symbol);
			return keys.includes(n) || keys.includes(s);
		}) || null;

	if (!row) {
		row =
			VCOPrices.find((e) => {
				const n = norm(e.name);
				const s = norm(e.symbol);
				return keys.some(
					(k) =>
						n.includes(k) || s.includes(k) || k.includes(n) || k.includes(s)
				);
			}) || null;
	}

	return row;
};

const WETH_ADDRESSES = new Set([
	"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase(),
	"0x4200000000000000000000000000000000000006".toLowerCase(),
]);

const normalizeTokenSymbol = (symbol, address, fallbackLabel) => {
	const normalizedSymbol = symbol?.trim();
	const addressLower = address?.toLowerCase() ?? "";
	if (addressLower && WETH_ADDRESSES.has(addressLower)) {
		return "WETH";
	}
	if (normalizedSymbol && !/^token\d*$/i.test(normalizedSymbol)) {
		return normalizedSymbol;
	}
	if (fallbackLabel) return fallbackLabel;
	if (addressLower) {
		return `${addressLower.slice(0, 4)}…${addressLower.slice(-4)}`;
	}
	return "Token";
};

const TokenInfoComponent = ({
	tokenInfo,
	onSelectChange,
	style,
	selectedContractAddress,
	pairHistory,
	holdersDetail,
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
	const [fiatReference, setFiatReference] = useState({
		ethUsd: null,
		usdArs: null,
		vcoPriceArs: null,
	});
	const [rangeStart, setRangeStart] = useState("");
	const [rangeEnd, setRangeEnd] = useState("");
	const [rangeResult, setRangeResult] = useState(null);
	const [year, setYear] = useState("");
	const [yearResult, setYearResult] = useState(null);

	const [salesPage, setSalesPage] = useState(1);
	const [salesPageSize, setSalesPageSize] = useState(25);
	const [wineryFilter, setWineryFilter] = useState("");

	const [transfersPage, setTransfersPage] = useState(1);
	const [transfersPageSize] = useState(5);

	const [holdersPage, setHoldersPage] = useState(1);
	const [holdersPageSize] = useState(5);

	const [reservesPage, setReservesPage] = useState(1);
	const [reservesPageSize, setReservesPageSize] = useState(5);

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

	const vcoRow = useMemo(
		() => pickVcoRow({ name, displayName, symbol }),
		[name, displayName, symbol]
	);

	const vcoTokenIssuance =
		vcoRow?.tokenIssuance ?? vcoRow?.tokenInssuance ?? null;
	const vcoHasUsd = vcoRow && (vcoRow.priceUsd != null || vcoRow.price != null);
	const vcoPriceUsd = vcoRow?.priceUsd ?? vcoRow?.price ?? null;
	const vcoPriceEth = vcoRow?.priceEth ?? null;

	useEffect(() => {
		const fetchFiatReference = async () => {
			try {
				const [ethUsdRes, usdArsRes] = await Promise.all([
					axios
						.get("https://criptoya.com/api/bitsoalpha/eth/usd")
						.catch(() => null),
					axios
						.get("https://criptoya.com/api/argenbtc/usdt/ars")
						.catch(() => null),
				]);

				const ethUsdRate = ethUsdRes?.data?.totalAsk
					? Number(ethUsdRes.data.totalAsk)
					: null;
				const usdArsRate = usdArsRes?.data?.ask
					? Number(usdArsRes.data.ask)
					: null;

				let vcoPriceArsVal = null;
				if (vcoRow?.priceArs != null) {
					vcoPriceArsVal = Number(vcoRow.priceArs);
				} else if (vcoHasUsd && vcoPriceUsd != null && usdArsRate != null) {
					vcoPriceArsVal = vcoPriceUsd * usdArsRate;
				} else if (
					vcoPriceEth != null &&
					ethUsdRate != null &&
					usdArsRate != null
				) {
					vcoPriceArsVal = vcoPriceEth * ethUsdRate * usdArsRate;
				}

				setFiatReference({
					ethUsd: ethUsdRate,
					usdArs: usdArsRate,
					vcoPriceArs: vcoPriceArsVal,
				});
			} catch (error) {
				console.error("No se pudo actualizar la referencia fiat", error);
				setFiatReference({ ethUsd: null, usdArs: null, vcoPriceArs: null });
			}
		};

		fetchFiatReference();
	}, [vcoHasUsd, vcoPriceUsd, vcoPriceEth, vcoRow?.priceArs]);
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
	const getExplorerTxUrl = (hash) =>
		hash ? `${explorerBaseUrl}/tx/${hash}` : null;

	const toNumeric = (value) => {
		if (value === null || value === undefined) return null;
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
		const stripped = Number(String(value).replace(/,/g, ""));
		return Number.isFinite(stripped) ? stripped : null;
	};

	const formatReserve = (value, decimals = 4) => {
		const numeric = toNumeric(value);
		if (numeric === null) return "—";
		return numeric.toLocaleString(undefined, {
			maximumFractionDigits: decimals,
		});
	};

	const formatFiat = (value, currency = "USD") => {
		const numeric = toNumeric(value);
		if (numeric === null) return "—";
		return numeric.toLocaleString(undefined, {
			style: "currency",
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	const formatDateTime = (input) => {
		if (!input) return "—";
		let dateInstance = null;
		if (typeof input === "number") {
			dateInstance = new Date(input > 1e12 ? input : input * 1000);
		} else if (typeof input === "string") {
			const parsed = Date.parse(input);
			if (!Number.isNaN(parsed)) {
				dateInstance = new Date(parsed);
			}
		}
		if (!dateInstance || Number.isNaN(dateInstance.getTime())) return "—";
		return dateInstance.toLocaleString();
	};

	const tokenAddressLower = (tokenContract || address || "").toLowerCase();
	const token0Meta = pairHistory?.pair?.token0 ?? {};
	const token1Meta = pairHistory?.pair?.token1 ?? {};
	const tokenPairAddressLower = token0Meta.address?.toLowerCase() ?? "";
	const tokenIsToken0 =
		tokenPairAddressLower &&
		tokenAddressLower &&
		tokenPairAddressLower === tokenAddressLower;
	const token0Decimals = Number(pairHistory?.pair?.token0?.decimals ?? 18);
	const token1Decimals = Number(pairHistory?.pair?.token1?.decimals ?? 18);

	const primarySymbolLabel = normalizeTokenSymbol(
		tokenIsToken0 ? token0Meta.symbol : token1Meta.symbol,
		tokenIsToken0 ? token0Meta.address : token1Meta.address,
		symbol || displayName || "Token"
	);
	const baseSymbolLabel = normalizeTokenSymbol(
		tokenIsToken0 ? token1Meta.symbol : token0Meta.symbol,
		tokenIsToken0 ? token1Meta.address : token0Meta.address,
		"WETH"
	);

	const extractReserveUnits = (entry, key, decimals) => {
		const toNum = (v) => {
			if (v === null || v === undefined) return null;
			const n = Number(String(v).replace(/,/g, ""));
			return Number.isFinite(n) ? n : null;
		};

		const pick = (obj, keys) => {
			for (const k of keys) {
				const n = toNum(obj?.[k]);
				if (n !== null) return n;
			}
			return null;
		};

		let n =
			pick(entry, [`${key}Formatted`]) ??
			pick(entry?.reserves ?? {}, [`${key}Formatted`]);
		if (n !== null) return n;

		if (entry?.tokenReserves) {
			const which = key === "reserve0" ? "token0" : "token1";
			const node = entry.tokenReserves?.[which];
			if (node) {
				n = pick(node, [
					"amountFormatted",
					"formattedAmount",
					"reserveFormatted",
					"valueFormatted",
				]);
				if (n !== null) return n;

				const raw = pick(node, [
					"amount",
					"reserve",
					"value",
					"raw",
					"rawValue",
					"wei",
				]);
				if (raw !== null) return raw / Math.pow(10, decimals);
			}
		}

		const rawFlat =
			pick(entry, [key, `${key}Raw`, `${key}Wei`]) ??
			pick(entry?.reserves ?? {}, [key, `${key}Raw`, `${key}Wei`]);
		if (rawFlat !== null) return rawFlat / Math.pow(10, decimals);

		return null;
	};

	const yearEndBalances = useMemo(() => {
		const entries = Array.isArray(pairHistory?.summary?.reservesByYearEnd)
			? pairHistory.summary.reservesByYearEnd
			: [];
		return entries
			.map((entry) => {
				const reservePrimary = tokenIsToken0
					? extractReserveUnits(entry, "reserve0", token0Decimals)
					: extractReserveUnits(entry, "reserve1", token1Decimals);
				const reserveBase = tokenIsToken0
					? extractReserveUnits(entry, "reserve1", token1Decimals)
					: extractReserveUnits(entry, "reserve0", token0Decimals);
				const timestamp =
					entry.blockTimestamp ??
					entry.timestamp ??
					entry.blockTimestampLast ??
					null;
				const isoDate = entry.isoDate ?? entry.readableDate ?? null;
				const dateLabel = formatDateTime(isoDate || timestamp);
				const year =
					entry.year ??
					(() => {
						if (!timestamp && !isoDate) return null;
						const dateSource =
							typeof timestamp === "number"
								? new Date(timestamp > 1e12 ? timestamp : timestamp * 1000)
								: new Date(isoDate);
						return Number.isNaN(dateSource.getTime())
							? null
							: dateSource.getFullYear();
					})();
				return {
					year,
					dateLabel,
					tokenReserve: reservePrimary,
					baseReserve: reserveBase,
					blockNumber: entry.blockNumber ?? entry.block ?? null,
				};
			})
			.filter((entry) => entry.year !== null)
			.sort((a, b) => a.year - b.year);
	}, [pairHistory, tokenIsToken0, token0Decimals, token1Decimals]);

	const currentReservesMeta =
		pairHistory?.summary?.currentReserves ??
		pairHistory?.pair?.currentReserves ??
		null;
	const currentReserves = currentReservesMeta
		? {
				tokenReserve: tokenIsToken0
					? extractReserveUnits(currentReservesMeta, "reserve0", token0Decimals)
					: extractReserveUnits(
							currentReservesMeta,
							"reserve1",
							token1Decimals
					  ),
				baseReserve: tokenIsToken0
					? extractReserveUnits(currentReservesMeta, "reserve1", token1Decimals)
					: extractReserveUnits(
							currentReservesMeta,
							"reserve0",
							token0Decimals
					  ),
				blockTimestamp:
					currentReservesMeta.blockTimestampLast ??
					currentReservesMeta.blockTimestamp ??
					null,
				blockNumber:
					currentReservesMeta.blockNumber ?? currentReservesMeta.block ?? null,
		  }
		: null;

	const combinedReserves = useMemo(() => {
		const currentYear = new Date().getFullYear();

		let historical = (yearEndBalances || [])
			.filter((e) => e.year && e.year < currentYear)
			.map((e) => ({ ...e }))
			.sort((a, b) => b.year - a.year); // newest first

		if (historical.length === 0) {
			const raw = Array.isArray(pairHistory?.summary?.reservesByYearEnd)
				? pairHistory.summary.reservesByYearEnd
				: [];

			historical = raw
				.map((entry) => {
					const getYearFromEntry = () => {
						if (entry.year) return entry.year;
						const isoDate = entry.isoDate ?? entry.readableDate ?? null;
						const ts =
							entry.blockTimestamp ??
							entry.timestamp ??
							entry.blockTimestampLast ??
							null;
						const d = isoDate
							? new Date(isoDate)
							: ts
							? new Date(ts > 1e12 ? ts : ts * 1000)
							: null;
						return d && !Number.isNaN(d.getTime()) ? d.getFullYear() : null;
					};

					const y = getYearFromEntry();
					const reservePrimary = tokenIsToken0
						? extractReserveUnits(entry, "reserve0", token0Decimals)
						: extractReserveUnits(entry, "reserve1", token1Decimals);
					const reserveBase = tokenIsToken0
						? extractReserveUnits(entry, "reserve1", token1Decimals)
						: extractReserveUnits(entry, "reserve0", token0Decimals);

					const isoDate = entry.isoDate ?? entry.readableDate ?? null;
					const ts =
						entry.blockTimestamp ??
						entry.timestamp ??
						entry.blockTimestampLast ??
						null;

					return {
						year: y,
						dateLabel: formatDateTime(isoDate || ts),
						tokenReserve: reservePrimary,
						baseReserve: reserveBase,
						blockNumber: entry.blockNumber ?? entry.block ?? null,
					};
				})
				.filter((e) => e.year && e.year < currentYear)
				.sort((a, b) => b.year - a.year);
		}

		let list = [...historical];
		if (currentReserves) {
			const maybeDuplicate = list.some((e) => e.year === currentYear);
			if (!maybeDuplicate) {
				list.unshift({
					year: currentYear,
					dateLabel: formatDateTime(currentReserves.blockTimestamp),
					tokenReserve: currentReserves.tokenReserve,
					baseReserve: currentReserves.baseReserve,
					blockNumber: currentReserves.blockNumber,
					isCurrent: true,
				});
			} else {
				list = list.map((e) =>
					e.year === currentYear ? { ...e, isCurrent: true } : e
				);
			}
		}

		return list;
	}, [
		yearEndBalances,
		currentReserves,
		pairHistory,
		tokenIsToken0,
		token0Decimals,
		token1Decimals,
	]);

	const totalReservesRows = combinedReserves.length;
	const totalReservesPages = Math.max(
		1,
		Math.ceil(totalReservesRows / reservesPageSize)
	);

	const pagedCombinedReserves = useMemo(() => {
		const start = (reservesPage - 1) * reservesPageSize;
		const end = start + reservesPageSize;
		return combinedReserves.slice(start, end);
	}, [combinedReserves, reservesPage, reservesPageSize]);

	useEffect(() => {
		if (reservesPage > totalReservesPages) setReservesPage(totalReservesPages);
	}, [totalReservesPages, reservesPage]);

	const transferEvents = useMemo(() => {
		const rawTransfers = Array.isArray(pairHistory?.events?.transfers)
			? pairHistory.events.transfers
			: [];
		return rawTransfers
			.map((event) => {
				const hash =
					event.transactionHash ?? event.hash ?? event.txHash ?? null;
				const value =
					event.valueFormatted ?? event.value ?? event.amount ?? null;
				const timestamp =
					event.timestamp ?? event.blockTimestamp ?? event.isoDate ?? null;

				const logIndex =
					event.logIndex ?? event.transactionIndex ?? event.log_index ?? null;

				return {
					hash,
					from: event.from ?? event.sender ?? null,
					to: event.to ?? event.recipient ?? null,
					value,
					timestamp,
					blockNumber: event.blockNumber ?? event.block ?? null,
					logIndex,
				};
			})
			.filter((item) => item.hash)
			.sort((a, b) => (b.blockNumber ?? 0) - (a.blockNumber ?? 0))
			.slice(0, 10);
	}, [pairHistory]);

	const formatAddressShort = (addr) => {
		if (!addr) return "—";
		return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
	};

	const holders = useMemo(() => {
		if (Array.isArray(holdersDetail) && holdersDetail.length > 0)
			return holdersDetail;
		if (Array.isArray(tokenInfo?.holders) && tokenInfo.holders.length > 0)
			return tokenInfo.holders;
		return [];
	}, [holdersDetail, tokenInfo]);

	const totalTransfersRows = transferEvents.length;
	const totalTransfersPages = Math.max(
		1,
		Math.ceil(totalTransfersRows / transfersPageSize)
	);
	const pagedTransfers = useMemo(() => {
		const start = (transfersPage - 1) * transfersPageSize;
		const end = start + transfersPageSize;
		return transferEvents.slice(start, end);
	}, [transferEvents, transfersPage, transfersPageSize]);

	useEffect(() => {
		if (transfersPage > totalTransfersPages)
			setTransfersPage(totalTransfersPages);
	}, [totalTransfersPages, transfersPage]);

	const totalHoldersRows = holders.length;
	const totalHoldersPages = Math.max(
		1,
		Math.ceil(totalHoldersRows / holdersPageSize)
	);
	const pagedHolders = useMemo(() => {
		const start = (holdersPage - 1) * holdersPageSize;
		const end = start + holdersPageSize;
		return holders.slice(start, end);
	}, [holders, holdersPage, holdersPageSize]);

	useEffect(() => {
		if (holdersPage > totalHoldersPages) setHoldersPage(totalHoldersPages);
	}, [totalHoldersPages, holdersPage]);

	// Derive current token price in BASE (ETH/WETH) directly from pool reserves when possible.
	const derivedPriceEth = useMemo(() => {
		if (!currentReserves) return null;
		const t = toNumeric(currentReserves.tokenReserve);
		const b = toNumeric(currentReserves.baseReserve);
		if (t === null || b === null || t <= 0) return null;
		// price of 1 TOKEN in BASE is BASE / TOKEN (since reserves are in native units)
		const p = b / t;
		return Number.isFinite(p) ? p : null;
	}, [currentReserves]);

	// Prefer on-chain derived price, fallback to tokenInfo.price when valid
	const effectivePriceEth = useMemo(() => {
		const pInfo = toNumeric(price);
		if (derivedPriceEth != null && derivedPriceEth > 0) return derivedPriceEth;
		return pInfo != null && pInfo > 0 ? pInfo : null;
	}, [derivedPriceEth, price]);

	const currentPriceUsd =
		effectivePriceEth !== null && fiatReference.ethUsd !== null
			? effectivePriceEth * fiatReference.ethUsd
			: null;
	const currentPriceArs =
		currentPriceUsd !== null && fiatReference.usdArs !== null
			? currentPriceUsd * fiatReference.usdArs
			: null;
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
					{ label: "REDEEMS", value: burnedTokens },
					!archived && tokensToBurn !== null && tokensToBurn !== undefined
						? { label: "REDEEMS LEGADOS PENDIENTES", value: tokensToBurn }
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
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white/70 rounded-lg p-4 shadow-sm space-y-3">
					<h2 className="text-lg font-semibold text-gray-900">{t("price")}</h2>
					<p className="text-sm text-gray-600">
						{t("price_eth") || "Precio actual (ETH)"}:{" "}
						<span className="font-semibold text-gray-900">
							{effectivePriceEth && effectivePriceEth > 0
								? effectivePriceEth.toFixed(6)
								: "—"}
						</span>
					</p>
					<p className="text-sm text-gray-600">
						Precio actual (USD):{" "}
						<span className="font-semibold text-gray-900">
							{currentPriceUsd !== null
								? formatFiat(currentPriceUsd, "USD")
								: "—"}
						</span>
					</p>
					<p className="text-sm text-gray-600">
						Precio actual (ARS):{" "}
						<span className="font-semibold text-gray-900">
							{currentPriceArs !== null
								? formatFiat(currentPriceArs, "ARS")
								: "—"}
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
								{vcoRow?.dateStart ?? "—"}
							</span>
						</div>

						<div>
							<span className="uppercase text-xs text-gray-500 block">
								{t("vco_end")}
							</span>
							<span className="font-semibold text-gray-900">
								{vcoRow?.dateEnd ?? "—"}
							</span>
						</div>

						<div>
							<span className="uppercase text-xs text-gray-500 block">
								{t("token_issuance")}
							</span>
							<span className="font-semibold text-gray-900">
								{formatNumber(vcoTokenIssuance)}{" "}
							</span>
						</div>

						<div>
							<span className="uppercase text-xs text-gray-500 block">
								{vcoHasUsd ? "Precio VCO (USD)" : vcoPriceLabel}
							</span>
							<span className="font-semibold text-gray-900">
								{vcoHasUsd
									? vcoPriceUsd != null
										? formatFiat(vcoPriceUsd, "USD")
										: "—"
									: vcoPriceEth != null
									? `${vcoPriceEth} ETH`
									: "—"}
							</span>
						</div>

						<div>
							<span className="uppercase text-xs text-gray-500 block">
								Precio VCO (ARS)
							</span>
							<span className="font-semibold text-gray-900">
								{fiatReference.vcoPriceArs !== null
									? formatFiat(fiatReference.vcoPriceArs, "ARS")
									: "—"}
							</span>
						</div>

						<div>
							<span className="uppercase text-xs text-gray-500 block">
								{t("network") || "Network"}
							</span>
							<span className="font-semibold text-gray-900">Ethereum</span>
						</div>
					</div>
				</div>
			</div>

			{combinedReserves.length > 0 && (
				<div className="bg-white/70 rounded-lg p-4 shadow-sm space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-900">
							Reservas del pool
						</h2>
						<div className="flex items-center gap-3 text-sm">
							<label className="text-gray-600">
								Página {reservesPage} / {totalReservesPages}
							</label>
							<select
								value={reservesPageSize}
								onChange={(e) => {
									setReservesPageSize(Number(e.target.value));
									setReservesPage(1);
								}}
								className="border rounded px-2 py-1 text-sm"
							>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={20}>20</option>
							</select>
							<div className="flex items-center gap-2">
								<button
									onClick={() => setReservesPage((p) => Math.max(1, p - 1))}
									disabled={reservesPage <= 1}
									className="px-2 py-1 border rounded disabled:opacity-50"
								>
									‹ Prev
								</button>
								<button
									onClick={() =>
										setReservesPage((p) => Math.min(totalReservesPages, p + 1))
									}
									disabled={reservesPage >= totalReservesPages}
									className="px-2 py-1 border rounded disabled:opacity-50"
								>
									Next ›
								</button>
							</div>
						</div>
					</div>

					<ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white/60">
						{pagedCombinedReserves.map((entry, idx) => (
							<li
								key={`reserves-${entry.year}-${entry.blockNumber || idx}`}
								className="p-3 text-sm text-gray-700 space-y-1"
							>
								<div className="flex items-center justify-between">
									<div className="font-semibold text-gray-900">
										{entry.isCurrent ? (
											<span>Año {entry.year} (actual)</span>
										) : (
											<span>Año {entry.year}</span>
										)}
									</div>
									{entry.blockNumber && (
										<span className="text-xs text-gray-500">
											Bloque {entry.blockNumber}
										</span>
									)}
								</div>
								<div className="text-xs text-gray-500">{entry.dateLabel}</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div>
										<span className="uppercase text-[11px] text-gray-500 block">
											{primarySymbolLabel}
										</span>
										<span className="font-semibold text-gray-900">
											{formatReserve(entry.tokenReserve)}
										</span>
									</div>
									<div>
										<span className="uppercase text-[11px] text-gray-500 block">
											{baseSymbolLabel}
										</span>
										<span className="font-semibold text-gray-900">
											{formatReserve(entry.baseReserve)}
										</span>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}

			{pairHistory && (
				<PoolHistoryChart
					pairHistory={pairHistory}
					tokenAddress={tokenContract || address}
					tokenSymbol={symbol || displayName}
				/>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Bloque: Transferencias */}
				<div className="bg-white/70 rounded-lg p-4 shadow-sm space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-900">
							Transferencias
						</h2>
						<div className="flex items-center gap-3 text-sm">
							<span className="text-gray-600">
								Total:{" "}
								<span className="font-semibold text-gray-900">
									{formatNumber(totalTransfers)}
								</span>
							</span>
							<label className="text-gray-600">
								Página {transfersPage} / {totalTransfersPages}
							</label>
							<div className="flex items-center gap-2">
								<button
									onClick={() => setTransfersPage((p) => Math.max(1, p - 1))}
									disabled={transfersPage <= 1}
									className="px-2 py-1 border rounded disabled:opacity-50"
								>
									‹ Prev
								</button>
								<button
									onClick={() =>
										setTransfersPage((p) =>
											Math.min(totalTransfersPages, p + 1)
										)
									}
									disabled={transfersPage >= totalTransfersPages}
									className="px-2 py-1 border rounded disabled:opacity-50"
								>
									Next ›
								</button>
							</div>
						</div>
					</div>

					{pagedTransfers.length > 0 ? (
						<ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white/60">
							{pagedTransfers.map((event) => (
								<li
									key={`${event.hash}-${event.logIndex ?? 0}`}
									className="space-y-1 p-3 text-sm text-gray-700"
								>
									<Link
										href={getExplorerTxUrl(event.hash) ?? "#"}
										target="_blank"
										rel="noopener noreferrer"
										className="font-semibold text-[#1d4ed8] hover:underline"
									>
										{formatDateTime(event.timestamp)}
									</Link>
									<p className="text-xs text-gray-500">
										De{" "}
										{event.from ? (
											<Link
												href={getExplorerUrl(event.from) ?? "#"}
												target="_blank"
												rel="noopener noreferrer"
												className="hover:underline"
											>
												{formatAddressShort(event.from)}
											</Link>
										) : (
											"—"
										)}{" "}
										→{" "}
										{event.to ? (
											<Link
												href={getExplorerUrl(event.to) ?? "#"}
												target="_blank"
												rel="noopener noreferrer"
												className="hover:underline"
											>
												{formatAddressShort(event.to)}
											</Link>
										) : (
											"—"
										)}
									</p>
									<p className="text-xs text-gray-500">
										Valor: {formatReserve(event.value)} {primarySymbolLabel}
									</p>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-gray-500">
							No se registran transferencias recientes.
						</p>
					)}
				</div>

				{/* Bloque: Holders */}
				<div className="bg-white/70 rounded-lg p-4 shadow-sm space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-900">Holders</h2>
						<div className="flex items-center gap-3 text-sm">
							<span className="text-gray-600">
								Total:{" "}
								<span className="font-semibold text-gray-900">
									{formatNumber(
										holdersCount >= 0 ? holdersCount : holders.length
									)}
								</span>
							</span>
							<label className="text-gray-600">
								Página {holdersPage} / {totalHoldersPages}
							</label>

							<div className="flex items-center gap-2">
								<button
									onClick={() => setHoldersPage((p) => Math.max(1, p - 1))}
									disabled={holdersPage <= 1}
									className="px-2 py-1 border rounded disabled:opacity-50"
								>
									‹ Prev
								</button>
								<button
									onClick={() =>
										setHoldersPage((p) => Math.min(totalHoldersPages, p + 1))
									}
									disabled={holdersPage >= totalHoldersPages}
									className="px-2 py-1 border rounded disabled:opacity-50"
								>
									Next ›
								</button>
							</div>
						</div>
					</div>

					{pagedHolders.length > 0 ? (
						<ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white/60">
							{pagedHolders.map((h) => (
								<li
									key={h.address}
									className="space-y-1 p-3 text-sm text-gray-700"
								>
									<div className="flex items-center justify-between gap-3">
										<Link
											href={getExplorerUrl(h.address) ?? "#"}
											target="_blank"
											rel="noopener noreferrer"
											className="font-mono text-[#1d4ed8] hover:underline break-all"
										>
											{h.address}
										</Link>
										<span className="text-xs text-gray-600">
											{formatNumber(h.balance)}{" "}
											{symbol || displayName || "TOKEN"}
										</span>
									</div>
									{Array.isArray(h.tags) && h.tags.length > 0 && (
										<div className="text-[11px] text-gray-500">
											{h.tags.join(" · ")}
										</div>
									)}
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-gray-500">
							No hay holders para mostrar.
						</p>
					)}

					{holdersUrl && (
						<div className="text-right">
							<Link
								href={holdersUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-[#840C4A] underline"
							>
								{t("holders_wallets") || "Ver holders en explorador"}
							</Link>
						</div>
					)}
				</div>
			</div>

			<div className="bg-white/70 rounded-lg p-4 shadow-sm">
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-gray-900">
						{t("addresses") || "Direcciones"}
					</h2>
					{networkDisplay && (
						<span className="text-sm font-medium text-gray-700">
							{networkDisplay}
						</span>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
					{[
						{
							label: t("lp") || "Dirección del pool",
							value: pairHistory?.pair?.address,
							href: getExplorerUrl(pairHistory?.pair?.address),
						},
						{
							label: t("contract_address") || "Dirección del contrato",
							value: address,
							href: getExplorerUrl(address),
						},
						{
							label: t("crowdsale_address") || "Dirección de crowdsale",
							value: crowdsaleAddress,
							href: getExplorerUrl(crowdsaleAddress),
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
			</div>
		</div>
	);
};

export default TokenInfoComponent;
