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

const getCrowdsaleArtifact = (buildInfo) => {
  if (!buildInfo?.output?.contracts) return null;
  const match = Object.keys(buildInfo.output.contracts).find((key) =>
    key.includes("CrowdsaleOVI.sol")
  );
  if (!match) return null;
  const contract = buildInfo.output.contracts[match]?.CrowdsaleOVI;
  if (!contract || !contract.evm?.bytecode?.object) return null;
  return { contract, sourceName: match };
};

const crowdsaleArtifact = getCrowdsaleArtifact(oviBuildInfo);
const oviArtifact = getDaoArtifact(oviBuildInfo);
const daoArtifactInfo = oviArtifact || getDaoArtifact(ovtBuildInfo);

if (!crowdsaleArtifact) {
  throw new Error("No se encontró el artifact de OpenvinoDao con bytecode");
}

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

//crowdsale
const { contract: CrowdsaleContract, sourceName: crowdsaleSourceName } =
  crowdsaleArtifact;
const crowdsaleAbi = CrowdsaleContract.abi || [];
const crowdsaleBytecode = CrowdsaleContract.evm?.bytecode?.object || "";
const crowdsaleConstructorInputs =
  crowdsaleAbi.find((entry) => entry.type === "constructor")?.inputs || [];

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
        ? [name, symbol, recipient, defaultAdmin, pauser, rebaser]
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

  const deployCrowdsaleContract = async () => {
    const v = getValues();
    const wallet = v.crowdsale_wallet?.trim();
    const tokenAddress = v.token_address?.trim() || v.address?.trim();
    const ethCap = v.crowdsale_capWei;
    const openingTime = v.crowdsale_opening_time;
    const closingTime = v.crowdsale_closing_time;
    const phaseOneTokenCap = v.crowdsale_phase_one_cap;
    const ratePhaseOne = v.crowdsale_rate_phase_one_usd;
    const ratePhaseTwo = v.crowdsale_rate_phase_two_usd;
    const priceFeed = v.crowdsale_price_feed?.trim();
    const transferAmountRaw = v.crowdsale_transfer_amount;

    const isNilOrEmpty = (val) =>
      val === undefined || val === null || String(val).trim() === "";

    if (!account) throw new Error("Connect wallet first");
    if (
      !wallet ||
      !tokenAddress ||
      isNilOrEmpty(ethCap) ||
      isNilOrEmpty(openingTime) ||
      isNilOrEmpty(closingTime) ||
      isNilOrEmpty(phaseOneTokenCap) ||
      isNilOrEmpty(ratePhaseOne) ||
      isNilOrEmpty(ratePhaseTwo) ||
      !priceFeed
    ) {
      throw new Error("Missing crowdsale constructor arguments");
    }

    const signer = await ethers5Adapter.signer.toEthers({
      client,
      chain,
      account,
    });

    const factory = new ethers.ContractFactory(
      crowdsaleAbi,
      crowdsaleBytecode,
      signer
    );

    const sanitize = (value) => String(value).replace(/,/g, "").trim();

    const toBigNumber = (value, label) => {
      try {
        return ethers.BigNumber.from(sanitize(value));
      } catch (err) {
        throw new Error(`Invalid ${label}`);
      }
    };

    const parseUnitsSafe = (value, label, decimals = 18) => {
      try {
        return ethers.utils.parseUnits(sanitize(value), decimals);
      } catch (err) {
        throw new Error(`Invalid ${label}`);
      }
    };

    const saleTokenAmount = parseUnitsSafe(
      phaseOneTokenCap,
      "phase one cap (token amount to send)"
    );
    const transferAmount = isNilOrEmpty(transferAmountRaw)
      ? saleTokenAmount
      : parseUnitsSafe(
          transferAmountRaw,
          "transfer amount (token amount to send)"
        );

    const ctorArgs = [
      wallet,
      tokenAddress,
      ethers.utils.parseEther(sanitize(ethCap)),
      toBigNumber(openingTime, "opening time"),
      toBigNumber(closingTime, "closing time"),
      saleTokenAmount,
      parseUnitsSafe(ratePhaseOne, "rate phase one"),
      parseUnitsSafe(ratePhaseTwo, "rate phase two"),
      priceFeed,
    ];

    const contract = await factory.deploy(...ctorArgs);
    await contract.deployed();

    const tokenContract = new ethers.Contract(tokenAddress, abi, signer);
    const signerAddress = await signer.getAddress();
    const balance = await tokenContract.balanceOf(signerAddress);
    if (balance.lt(transferAmount)) {
      throw new Error(
        "Insufficient token balance to fund crowdsale. Asegúrate que el wallet conectado tenga los tokens o usa ese wallet como recipient/mint."
      );
    }

    const tx = await tokenContract.transfer(contract.address, transferAmount);
    await tx.wait();

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

      console.log("ctorArgs:", ctorArgs);

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
    handleDeployCrowdsale: async () => {
      const toastId = toast.loading("⏳ Deploying OVI crowdsale...", {
        theme: "dark",
      });
      try {
        const address = await deployCrowdsaleContract();
        setValue("crowdsale_address", address);
        const id = getValues("id") || getValues("symbol");
        if (id) {
          const updated = await updateDaoProvisioningRecord(id, {
            crowdsale_address: address,
          });
          setRecord && setRecord(updated);
        }
        toast.update(toastId, {
          render: "Crowdsale deployed",
          isLoading: false,
          type: "success",
          autoClose: 3000,
        });
        return address;
      } catch (error) {
        console.error("Crowdsale deploy failed:", error);
        toast.update(toastId, {
          render: error.message || "Crowdsale deploy failed",
          isLoading: false,
          type: "error",
          autoClose: 4000,
        });
        throw error;
      }
    },
  };
};

export default useDaoDeployment;
