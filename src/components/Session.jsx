import { useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const SessionSync = () => {
	const account = useActiveAccount();
	const { data: session, status } = useSession();
	const router = useRouter();
	const previousAddress = useRef(null);

	useEffect(() => {
		const currentAddress = account?.address?.toLowerCase();

		if (previousAddress.current && currentAddress !== previousAddress.current) {
			console.log("⚡ Wallet cambiada o desconectada");
			signOut({ redirect: false }).finally(() => {
				router.replace("/");
				previousAddress.current = null;
			});
			return;
		}

		if (!currentAddress && session) {
			console.log("Wallet desconectada con sesión activa");
			signOut({ redirect: false }).finally(() => {
				router.replace("/");
				previousAddress.current = null;
			});
			return;
		}

		if (currentAddress && !session && status === "unauthenticated") {
			console.log("Intentando login con wallet:", currentAddress);
			signIn("credentials", {
				address: currentAddress,
				redirect: false,
			}).then((res) => {
				if (res?.ok) {
					console.log("Login exitoso");
					router.replace("/dashboard");
					previousAddress.current = currentAddress;
				} else {
					console.log("Login fallido:", res);
					// toast.error("Wallet no autorizada");
					signOut({ redirect: false }).finally(() => {
						router.replace("/");
					});
				}
			});
		}

		if (currentAddress && session) {
			previousAddress.current = currentAddress;
		}
	}, [account?.address, session, status, router]);

	return null;
};

export default SessionSync;
