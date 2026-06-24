import { useEffect, useState, useCallback } from "react";
import { useSession, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import HomeLayout from "@/components/HomeLayout";
import { isCostafloresAdmin } from "@/utils/authUtils";
import clientAxios from "@/config/clientAxios";

const MultilingualRichTextEditor = dynamic(
  () =>
    import("@/components/MultilingualRichTextEditor").then(
      (m) => m.MultilingualRichTextEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 bg-gray-50 border border-gray-300 rounded-md animate-pulse" />
    ),
  }
);

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function PlatformContent() {
  const session = useSession();
  const { t } = useTranslation();

  // --- Common description ---
  const [savingCommon, setSavingCommon] = useState(false);
  const { control: commonControl, reset: resetCommon, handleSubmit: handleCommonSubmit } = useForm({
    defaultValues: { common_description: "" },
  });

  useEffect(() => {
    clientAxios.get("/platformSettingsRoute").then(({ data }) => {
      if (data?.common_description) {
        resetCommon({
          common_description:
            typeof data.common_description === "string"
              ? data.common_description
              : JSON.stringify(data.common_description),
        });
      }
    }).catch((err) => {
      console.error("Error loading platform settings:", err);
    });
  }, [resetCommon]);

  const onSaveCommon = async ({ common_description }) => {
    setSavingCommon(true);
    try {
      await clientAxios.put("/platformSettingsRoute", { common_description });
      toast.success(t("platform_content_saved"));
    } catch {
      toast.error(t("error_updating"));
    } finally {
      setSavingCommon(false);
    }
  };

  // --- Token descriptions ---
  const [tokens, setTokens] = useState([]);
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const [savingToken, setSavingToken] = useState(false);
  const { control: tokenControl, reset: resetToken, handleSubmit: handleTokenSubmit } = useForm({
    defaultValues: { description: "" },
  });

  useEffect(() => {
    clientAxios.get("/tokensLaunchAll").then(({ data }) => {
      setTokens(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const handleTokenSelect = useCallback((id) => {
    setSelectedTokenId(id);
    const token = tokens.find((t) => t.id === id);
    resetToken({
      description: token?.description
        ? (typeof token.description === "string" ? token.description : JSON.stringify(token.description))
        : "",
    });
  }, [tokens, resetToken]);

  const onSaveToken = async ({ description }) => {
    if (!selectedTokenId) return;
    setSavingToken(true);
    try {
      await clientAxios.patch("/tokensLaunchRoute", {
        params: { id: selectedTokenId, description },
      });
      // update local cache so switching back keeps the new value
      setTokens((prev) =>
        prev.map((t) => t.id === selectedTokenId ? { ...t, description } : t)
      );
      toast.success(t("token_description_saved"));
    } catch {
      toast.error(t("error_updating"));
    } finally {
      setSavingToken(false);
    }
  };

  if (!isCostafloresAdmin(session)) return null;

  return (
    <HomeLayout>
      <ToastContainer />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
          {t("platform_content_title")}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {t("platform_content_subtitle")}
        </p>

        {/* Common description */}
        <Section title={t("common_description")}>
          <form onSubmit={handleCommonSubmit(onSaveCommon)}>
            <MultilingualRichTextEditor
              control={commonControl}
              name="common_description"
            />
            <button
              type="submit"
              disabled={savingCommon}
              className="mt-4 px-6 py-2 bg-[#840C4A] text-white rounded-md hover:bg-[#6a0a3b] disabled:opacity-50 transition-colors"
            >
              {savingCommon ? t("Wait please...") : t("guardar")}
            </button>
          </form>
        </Section>

        {/* Token descriptions */}
        <Section title={t("token_descriptions")}>
          <select
            value={selectedTokenId}
            onChange={(e) => handleTokenSelect(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#840C4A]"
          >
            <option value="">{t("select_token")}</option>
            {tokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.name} ({token.id})
              </option>
            ))}
          </select>

          {selectedTokenId && (
            <form onSubmit={handleTokenSubmit(onSaveToken)}>
              <MultilingualRichTextEditor
                control={tokenControl}
                name="description"
              />
              <button
                type="submit"
                disabled={savingToken}
                className="mt-4 px-6 py-2 bg-[#840C4A] text-white rounded-md hover:bg-[#6a0a3b] disabled:opacity-50 transition-colors"
              >
                {savingToken ? t("Wait please...") : t("guardar")}
              </button>
            </form>
          )}
        </Section>
      </div>
    </HomeLayout>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: {} };
}
