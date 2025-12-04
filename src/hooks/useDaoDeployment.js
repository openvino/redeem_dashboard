import { useActiveAccount } from "thirdweb/react";
import { ethers } from "ethers";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { chain, client } from "@/config/thirdwebClient";
import { toast } from "react-toastify";
import { activeNetwork, openvinoApiKey, openvinoApiURL } from "@/config";
import oviBuildInfo from "../../contracts/artifacts/OVI.json";
import ovtBuildInfo from "../../contracts/artifacts/OVT.json";
import { updateDaoProvisioningRecord } from "@/utils/daoProvisioningUtils";

const getDaoArtifact = (buildInfo) => {
	if (!buildInfo?.output?.contracts) return null;
	const match = Object.keys(buildInfo.output.contracts).find((key) =>
		key.includes("OpenvinoDao.sol")
	);
	if (!match) return null;
	const contract = buildInfo.output.contracts[match]?.OpenvinoDao;
	if (!contract || !contract.evm?.bytecode?.object) return null;
	return { contract, sourceName: match };
};

const oviArtifact = getDaoArtifact(oviBuildInfo);
const daoArtifactInfo = oviArtifact || getDaoArtifact(ovtBuildInfo);

if (!daoArtifactInfo) {
	throw new Error("No se encontró el artifact de OpenvinoDao con bytecode");
}

if (!oviArtifact) {
	console.warn(
		"[DAO deploy] OVI.json no tiene output; usando artifact legacy OVT. Compila OVI para desplegar la versión nueva."
	);
}

const { contract: OpenvinoDaoArtifact, sourceName: daoSourceName } =
	daoArtifactInfo;
const abi = OpenvinoDaoArtifact.abi || [];
const bytecode = OpenvinoDaoArtifact.evm?.bytecode?.object || "";
const constructorInputs =
	abi.find((entry) => entry.type === "constructor")?.inputs || [];

export const useDaoDeployment = ({ getValues, setValue, setRecord }) => {
	const account = useActiveAccount();
	const delay = (ms) => new Promise((res) => setTimeout(res, ms));

	const verifyDaoContract = async (address, ctorArgsEncoded) => {
		await delay(15000);
		const payload = {
			network: activeNetwork,
			address,
			contractName: `${daoSourceName}:OpenvinoDao`,
			compilerVersion: "v0.8.22+commit.4fc1097e",
			codeformat: "solidity-standard-json-input",
			optimizationUsed: "1",
			runs: "200",
			constructorArgs: ctorArgsEncoded,
		};
		// Debug payload sent to verifier
		console.log("DAO verify payload:", payload);
		return fetch(`${openvinoApiURL}/verify-contract`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": openvinoApiKey,
			},
			body: JSON.stringify(payload),
		});
	};

	const deployDaoToken = async () => {
		const v = getValues();
		const name = v.name?.trim();
		const symbol = v.symbol?.trim();
		const recipient = v.recipient?.trim();
		const defaultAdmin = v.default_admin?.trim();
		const rebaser = v.rebaser?.trim();
		const pauser = defaultAdmin;

		if (!account) throw new Error("Connect wallet first");
		if (!name || !symbol || !recipient || !defaultAdmin || !rebaser) {
			throw new Error("Missing required fields");
		}

		const signer = await ethers5Adapter.signer.toEthers({
			client,
			chain,
			account,
		});

		const factory = new ethers.ContractFactory(abi, bytecode, signer);
		const ctorArgs =
			constructorInputs.length === 6
				? [
						name,
						symbol,
						recipient,
						defaultAdmin,
						pauser,
						rebaser,
					]
				: constructorInputs.length === 3
					? [recipient, defaultAdmin, pauser]
					: (() => {
							throw new Error(
								`Constructor de OpenvinoDao no soportado (${constructorInputs.length} args)`
							);
						})();

		const contract = await factory.deploy(...ctorArgs);
		await contract.deployed();

		const oracleAddress = v.split_oracle?.trim();
		if (oracleAddress) {
			const signerAddress = await signer.getAddress();
			if (
				defaultAdmin &&
				signerAddress.toLowerCase() === defaultAdmin.toLowerCase()
			) {
				const tx = await contract.setOracle(oracleAddress);
				await tx.wait();
			} else {
				console.warn(
					"[DAO deploy] Se omitió setOracle porque el signer no es el admin por defecto"
				);
			}
		}

		return contract.address;
	};

	const handleDeployDao = async () => {
		const toastId = toast.loading("⏳ Deploying OVI DAO...", {
			theme: "dark",
		});
		try {
			const address = await deployDaoToken();
			setValue("token_address", address);
			const id = getValues("id") || getValues("symbol");
			if (id) {
				const updated = await updateDaoProvisioningRecord(id, { address });
				setRecord && setRecord(updated);
			}
			// Verify on Basescan
			const ctorArgs =
				constructorInputs.length === 6
					? [
							getValues("name")?.trim(),
							getValues("symbol")?.trim(),
							getValues("recipient")?.trim(),
							getValues("default_admin")?.trim(),
							getValues("default_admin")?.trim(),
							getValues("rebaser")?.trim(),
						]
					: constructorInputs.length === 3
						? [
								getValues("recipient")?.trim(),
								getValues("default_admin")?.trim(),
								getValues("default_admin")?.trim(),
							]
						: [];

			const ctorTypes = constructorInputs.map((input) => input.type);

			const ctorArgsEncoded = ethers.utils.defaultAbiCoder
				.encode(ctorTypes, ctorArgs)
				.replace(/^0x/, "");

			await verifyDaoContract(address, ctorArgsEncoded);

			toast.update(toastId, {
				render: "DAO token deployed & verification requested",
				isLoading: false,
				type: "success",
				autoClose: 3000,
			});
		} catch (error) {
			console.error("DAO deploy failed:", error);
			toast.update(toastId, {
				render: error.message || "Deploy failed",
				isLoading: false,
				type: "error",
				autoClose: 4000,
			});
			throw error;
		}
	};

	return {
		handleDeployDao,
	};
};

export default useDaoDeployment;
