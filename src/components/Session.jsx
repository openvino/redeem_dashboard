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

		// ✅ Si cambia la cuenta o se desconecta
		if (previousAddress.current && currentAddress !== previousAddress.current) {
			console.log("⚡ Wallet cambiada o desconectada");
			signOut({ redirect: false }).finally(() => {
				router.replace("/");
				previousAddress.current = null;
			});
			return;
		}

		// ✅ Si no hay cuenta pero hay sesión -> cerrar
		if (!currentAddress && session) {
			console.log("🔴 Wallet desconectada con sesión activa");
			signOut({ redirect: false }).finally(() => {
				router.replace("/");
				previousAddress.current = null;
			});
			return;
		}

		// ✅ Si hay cuenta y no hay sesión -> intentar login
		if (currentAddress && !session && status === "unauthenticated") {
			console.log("🔐 Intentando login con wallet:", currentAddress);
			signIn("credentials", {
				address: currentAddress,
				redirect: false,
			}).then((res) => {
				if (res?.ok) {
					console.log("✅ Login exitoso");
					router.replace("/dashboard");
					previousAddress.current = currentAddress;
				} else {
					console.log("❌ Login fallido:", res);
					toast.error("Wallet no autorizada");
					signOut({ redirect: false }).finally(() => {
						router.replace("/");
					});
				}
			});
		}

		// ✅ Guardar cuenta actual si todo está bien
		if (currentAddress && session) {
			previousAddress.current = currentAddress;
		}
	}, [account?.address, session, status, router]);

	return null;
};

export default SessionSync;

// import { useEffect, useRef } from "react";
// import { signIn, signOut, useSession } from "next-auth/react";
// import { useActiveAccount } from "thirdweb/react";
// import { toast } from "react-toastify";
// import { useRouter } from "next/router";

// const SessionSync = () => {
// 	const account = useActiveAccount();
// 	const { data: session, status } = useSession();
// 	const router = useRouter();
// 	const previousAddressRef = useRef(null);
// 	const isHandlingRef = useRef(false);

// 	useEffect(() => {
// 		const currentAddress = account?.address?.toLowerCase();

// 		if (isHandlingRef.current) return;

// 		if (previousAddressRef.current !== currentAddress) {
// 			isHandlingRef.current = true;

// 			if (currentAddress) {
// 				if (!session && status !== "loading") {
// 					signIn("credentials", {
// 						address: currentAddress,
// 						redirect: false,
// 					}).then((res) => {
// 						if (res?.ok) {
// 							router.replace("/dashboard");
// 						} else {
// 							toast.error("Wallet no autorizada");
// 							router.replace("/");
// 						}
// 						isHandlingRef.current = false;
// 					});
// 				} else {
// 					isHandlingRef.current = false;
// 				}
// 			} else if (session && status !== "loading") {
// 				signOut({ redirect: "/" }).finally(() => {
// 					router.replace("/");
// 					isHandlingRef.current = false;
// 				});
// 			} else {
// 				isHandlingRef.current = false;
// 			}

// 			previousAddressRef.current = currentAddress;
// 		}
// 	}, [account, session, status, router]);

// 	return null;
// };

// export default SessionSync;
