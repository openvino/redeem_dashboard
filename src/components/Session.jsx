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

	useEffect(() => {
		const currentAddress = account?.address?.toLowerCase();

		if (previousAddress.current && currentAddress !== previousAddress.current) {
			signOut({ redirect: false }).finally(async () => {
				await disconnect(wallet);
				router.replace("/");
				previousAddress.current = null;
			});
			return;
		}

		if (currentAddress && !session && status === "unauthenticated") {
			signIn("credentials", { address: currentAddress, redirect: false }).then(
				async (res) => {
					if (!res?.ok) {
						await disconnect(wallet);
						signOut({ redirect: false }).finally(() => {
							router.replace("/");
						});
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
