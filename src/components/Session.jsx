import { useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
	useActiveAccount,
	useActiveWallet,
	useDisconnect,
} from "thirdweb/react";
import { useRouter } from "next/router";

const SessionSync = () => {
	const account = useActiveAccount();
	const wallet = useActiveWallet();
	const { disconnect } = useDisconnect();
	const { data: session, status } = useSession();
	const router = useRouter();
	const previousAddress = useRef(null);
	const isSigningOut = useRef(false);

	useEffect(() => {
		const currentAddress = account?.address?.toLowerCase();
		const sessionAddress = session?.address?.toLowerCase();

		if (status === "loading" || isSigningOut.current) {
			return;
		}

		const closeSession = async ({ disconnectWallet = false } = {}) => {
			isSigningOut.current = true;
			previousAddress.current = null;

			try {
				await signOut({ redirect: false });
				if (disconnectWallet && wallet) {
					await disconnect(wallet);
				}
			} finally {
				router.replace("/");
				isSigningOut.current = false;
			}
		};

		if (session && !currentAddress) {
			closeSession();
			return;
		}

		if (
			currentAddress &&
			((previousAddress.current &&
				currentAddress !== previousAddress.current) ||
				(sessionAddress && sessionAddress !== currentAddress))
		) {
			closeSession({ disconnectWallet: true });
			return;
		}

		if (!currentAddress) {
			previousAddress.current = null;
			return;
		}

		if (!session && status === "unauthenticated") {
			signIn("credentials", { address: currentAddress, redirect: false }).then(
				async (res) => {
					if (!res?.ok) {
						await closeSession({ disconnectWallet: true });
					} else {
						previousAddress.current = currentAddress;
						router.replace("/dashboard");
					}
				}
			);
		}

		if (currentAddress && session) {
			previousAddress.current = currentAddress;
		}
	}, [account?.address, session, status, wallet, disconnect, router]);

	return null;
};

export default SessionSync;
