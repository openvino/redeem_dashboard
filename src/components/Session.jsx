import { useEffect, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const SessionSync = () => {
	const account = useActiveAccount();
	const { data: session } = useSession();
	const router = useRouter();
	const loginAttemptedRef = useRef(false);
	const [loginFailedFor, setLoginFailedFor] = useState(null);

	useEffect(() => {
		const tryLogin = async () => {
			const currentAddress = account?.address?.toLowerCase();

			if (!currentAddress || currentAddress === loginFailedFor) return;

			loginAttemptedRef.current = true;

			const res = await signIn("credentials", {
				address: currentAddress,
				redirect: false,
			});

			if (!res?.ok) {
				toast.error("Wallet no autorizada");
				setLoginFailedFor(currentAddress);
			} else {
				router.replace("/dashboard");
			}
		};

		if (account && !session) {
			tryLogin();
		}
	}, [account, session, loginFailedFor, router]);

	useEffect(() => {
		if (!account && session) {
			signOut({ redirect: "/" });
			loginAttemptedRef.current = false;
			setLoginFailedFor(null);
		}
	}, [account, session]);

	return null;
};

export default SessionSync;
