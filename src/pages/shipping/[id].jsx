import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import HomeLayout from "@/components/HomeLayout";
import useTokenShipping from "@/hooks/useTokenShipping";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { getProvinces, getCountries } from "@/redux/actions/winaryActions";
import clientAxios from "@/config/clientAxios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPencilAlt } from "react-icons/fa";

const TH = ({ children }) => (
  <th className="px-3 py-2 bg-[#840C4A] text-[0.75rem] text-white font-medium tracking-wider text-center border-r border-white/20 last:border-r-0">
    {children}
  </th>
);

const TD = ({ children, className = "" }) => (
  <td className={`px-3 py-1.5 text-[0.85rem] text-gray-900 text-center border-r border-gray-200 last:border-r-0 ${className}`}>
    {children}
  </td>
);

const TokenShippingInfo = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const { tokens: zones } = useTokenShipping(id);
  const dispatch = useDispatch();
  const provincesRaw = useSelector((s) => s.winaryAdress.provinces);
  const provinces = Array.isArray(provincesRaw) ? provincesRaw : [];
  const countriesRaw = useSelector((s) => s.winaryAdress.countries);
  const countries = Array.isArray(countriesRaw) ? countriesRaw : [];

  const [stockRows, setStockRows] = useState([]);
  const [stockDraft, setStockDraft] = useState({});
  const [newCountry, setNewCountry] = useState("");

  useEffect(() => {
    if (!provinces?.length) dispatch(getProvinces());
    if (!countries?.length) dispatch(getCountries());
  }, []);

  useEffect(() => {
    if (!id) return;
    clientAxios
      .get(`/tokenStockByCountryRoute?token_id=${id}`)
      .then(({ data }) => {
        setStockRows(data);
        const draft = {};
        data.forEach((r) => { draft[r.country_id] = r.stock; });
        setStockDraft(draft);
      })
      .catch(() => {});
  }, [id]);

  // Merge DB stock rows with countries inferred from zone province codes
  const mergedStockRows = React.useMemo(() => {
    if (!Array.isArray(zones) || !zones.length) return stockRows;
    const inferred = [...new Set(
      zones.map((z) => z.province_id?.split("-")[0]).filter(Boolean)
    )];
    const merged = [...stockRows];
    inferred.forEach((cid) => {
      if (!merged.find((r) => r.country_id === cid)) {
        merged.push({ token_id: id, country_id: cid, stock: 0 });
      }
    });
    return merged;
  }, [zones, stockRows, id]);

  const addCountry = () => {
    if (!newCountry || mergedStockRows.find((r) => r.country_id === newCountry)) return;
    setStockRows((prev) => [...prev, { token_id: id, country_id: newCountry, stock: 0 }]);
    setStockDraft((prev) => ({ ...prev, [newCountry]: 0 }));
    setNewCountry("");
  };

  const provinceName = (pid) =>
    provinces?.find((p) => p.province_id === pid)?.place_description ?? pid;

  const countryName = (cid) =>
    countries.find((c) => c.country_id === cid)?.place_description ?? "";

  const stockForCountry = (cid) =>
    stockRows.find((r) => r.country_id === cid)?.stock ?? "—";

  const saveStock = useCallback(async (country_id) => {
    const stock = stockDraft[country_id];
    try {
      const { data } = await clientAxios.put("/tokenStockByCountryRoute", {
        token_id: id, country_id, stock,
      });
      setStockRows((prev) => {
        const exists = prev.find((r) => r.country_id === country_id);
        return exists
          ? prev.map((r) => r.country_id === country_id ? data : r)
          : [...prev, data];
      });
      toast.success(t("stock_saved"));
    } catch {
      toast.error(t("error_updating"));
    }
  }, [id, stockDraft]);

  const saveZoneCountry = useCallback(async (province_id, stock_country) => {
    try {
      await clientAxios.patch("/tokenShippingRoute", {
        province_id,
        token_id: id,
        stock_country: stock_country || null,
      });
      toast.success(t("stock_country_saved"));
    } catch {
      toast.error(t("error_updating"));
    }
  }, [id]);

  return (
    <HomeLayout>
      <Head><title>Openvino — Shipping {id}</title></Head>
      <ToastContainer />

      <div className="px-4 py-6 space-y-10">

        {/* ── Tabla 1: Stock por país ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            {t("stock_by_country")} — {id}
          </h2>
          <div className="overflow-x-auto border border-gray-100">
            <table className="w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <TH>{t("pais")}</TH>
                  <TH>{t("stock_available")}</TH>
                  <TH />
                </tr>
              </thead>
              <tbody className="text-sm">
                {mergedStockRows.map((row, i) => (
                  <tr key={row.country_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                    <TD>{row.country_id}{countryName(row.country_id) ? ` — ${countryName(row.country_id)}` : ""}</TD>
                    <TD>
                      <input
                        type="number"
                        min="0"
                        value={stockDraft[row.country_id] ?? row.stock}
                        onChange={(e) =>
                          setStockDraft((p) => ({ ...p, [row.country_id]: e.target.value }))
                        }
                        className="w-24 px-2 py-0.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#840C4A]"
                      />
                    </TD>
                    <TD>
                      <button
                        onClick={() => saveStock(row.country_id)}
                        className="px-3 py-0.5 bg-[#840C4A] text-white text-xs rounded hover:bg-[#6a0a3b] transition-colors"
                      >
                        {t("guardar")}
                      </button>
                    </TD>
                  </tr>
                ))}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <TD>
                    <select
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className="w-full px-2 py-0.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#840C4A]"
                    >
                      <option value="">{t("select")}</option>
                      {countries
                        .filter((c) => !mergedStockRows.find((r) => r.country_id === c.country_id))
                        .map((c) => (
                          <option key={c.country_id} value={c.country_id}>
                            {c.country_id} — {c.place_description}
                          </option>
                        ))}
                    </select>
                  </TD>
                  <TD />
                  <TD>
                    <button
                      onClick={addCountry}
                      disabled={!newCountry}
                      className="px-3 py-0.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-40 transition-colors"
                    >
                      + {t("agregar")}
                    </button>
                  </TD>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Tabla 2: Costos de envío ────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            {t("shipping_zones")} — {id}
          </h2>
          <div className="overflow-x-auto border border-gray-100">
            <table className="w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <TH>Código</TH>
                  <TH>{t("provincia")}</TH>
                  <TH>{t("base_cost")}</TH>
                  <TH>{t("cost_per_unit")}</TH>
                  <TH>{t("zona_stock")}</TH>
                  <TH>{t("stock_available")}</TH>
                  <TH />
                </tr>
              </thead>
              <tbody className="text-sm">
                {zones?.map((zone, i) => (
                  <tr key={zone.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                    <TD className="font-mono text-xs text-gray-500">{zone.province_id}</TD>
                    <TD>{provinceName(zone.province_id)}</TD>
                    <TD>{zone.base_cost}</TD>
                    <TD>{zone.cost_per_unit}</TD>
                    <TD>
                      <select
                        defaultValue={zone.stock_country ?? ""}
                        onChange={(e) => saveZoneCountry(zone.province_id, e.target.value)}
                        className={`px-2 py-0.5 border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#840C4A] ${
                          zone.stock_country ? "border-gray-300" : "border-amber-400 text-amber-700"
                        }`}
                      >
                        <option value="">{t("sin_asignar")}</option>
                        {mergedStockRows.map((r) => (
                          <option key={r.country_id} value={r.country_id}>
                            {r.country_id}{countryName(r.country_id) ? ` — ${countryName(r.country_id)}` : ""}
                          </option>
                        ))}
                      </select>
                    </TD>
                    <TD>{stockForCountry(zone.stock_country)}</TD>
                    <TD>
                      <button
                        onClick={() => router.push(`/shipping/edit/${zone.id}`)}
                        title={t("editar")}
                      >
                        <FaPencilAlt className="text-gray-400 hover:text-gray-700 cursor-pointer" />
                      </button>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </HomeLayout>
  );
};

export default TokenShippingInfo;
