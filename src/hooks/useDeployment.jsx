import { useEffect, useState } from "react";
import { activeNetwork, openvinoApiURL, openvinoApiKey } from "@/config";
import { chain, client } from "@/config/thirdwebClient";
import { tokenLaunching, updateTokenInfo } from "@/utils";
import axios from "axios";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { useActiveAccount } from "thirdweb/react";
import {
  showLoadingToast,
  updateErrorToast,
  updateSuccessToast,
} from "../../helpers/toastHelpers";
import { useTranslation } from "react-i18next";
import { deployContract } from "@/utils/deplyContract";
import {
  tokenAbi,
  crowdAbi,
  crowdBytecode,
  tokenBytecode,
} from "@/contracts/contractsAbi";
import { toTimestamp } from "@/utils";
const useDeployment = (
  getValues,
  setTransferDisabled,
  setTransferDone,
  setDisableDeploy
) => {
  const [token, setToken] = useState({});
  const [loading, setLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [crowdsaleAddress, setCrowdsaleAddress] = useState("");
  const [selectedWinery, setSelectedWinery] = useState("");
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const account = useActiveAccount();
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation();

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const v = getValues();

  useEffect(() => {
    const fetchTokens = async () => {
      if (id) {
        const token = await tokenLaunching(id);
        setSelectedWinery(token.winery_id);
        setToken(token);
        console.log(token);
      }
    };
    fetchTokens();
  }, []);

  useEffect(() => {
    if (tokenAddress && crowdsaleAddress) {
      setDeploymentComplete(true);
    }
  }, [tokenAddress, crowdsaleAddress]);

  const verifyContract = async (address, name, constructorArgs) => {
    await delay(15000);
    return axios.post(
      `${openvinoApiURL}/verify-contract`,
      {
        network: activeNetwork,
        address,
        contractName: name,
        compilerVersion: "v0.8.22+commit.4fc1097e",
        codeformat: "solidity-standard-json-input",
        optimizationUsed: "1",
        runs: "200",
        constructorArgs,
      },
      {
        headers: { "x-api-key": openvinoApiKey },
      }
    );
  };

  const deployToken = async (toastId) => {
    const signer = await ethers5Adapter.signer.toEthers({
      client,
      chain,
      account,
    });

    if (!account) throw new Error("Connect wallet");

    const name = v.name?.trim();
    const symbol = v.symbol?.trim();
    const capInput = String(v.cap || "").trim();
    if (!name || !symbol || !capInput || isNaN(Number(capInput))) {
      throw new Error("Missing name, symbol or cap");
    }
    const capBN = ethers.utils.parseEther(capInput);
    showLoadingToast(toastId, t("Deploying token..."));

    const token = await deployContract(tokenAbi, tokenBytecode, signer, [
      name,
      symbol,
      capBN,
      capBN,
    ]);

    await token.deployed();
    setTokenAddress(token.address);
    showLoadingToast(toastId, "Token deployed, verifying on BaseScan...");

    const tokenCtorEncoded = ethers.utils.defaultAbiCoder
      .encode(
        ["string", "string", "uint256", "uint256"],
        [name, symbol, capBN, capBN]
      )
      .replace(/^0x/, "");

    await verifyContract(
      token.address,
      "contracts/OpenVinoToken.sol:OpenVinoToken",
      tokenCtorEncoded
    );

    await updateTokenInfo(symbol, { token_address: token.address });
    setToken((prevToken) => {
      return {
        ...prevToken,
        token_address: token.address,
      };
    });
    return token;
  };

  const deployCrowdsale = async (token, toastId) => {
    const signer = await ethers5Adapter.signer.toEthers({
      client,
      chain,
      account,
    });

    const symbol = v.symbol?.trim();
    const walletAddress = v.walletAddress?.trim();
    if (!walletAddress) throw new Error("Wallet address missing");

    const rate = Number(String(v.rate || "").trim());
    const openingTs = Math.floor(toTimestamp(v.openingTime));
    const closingTs = Math.floor(toTimestamp(v.closingTime));

    const tokensBN = ethers.utils.parseEther(
      String(v.tokensToCrowdsale || "").trim()
    );

    const weiCapBN = tokensBN.div(rate);
    if (weiCapBN.isZero())
      throw new Error("Rate demasiado alto para los tokens");

    showLoadingToast(toastId, "Deploying crowdsale contract...");

    const crowdsale = await deployContract(crowdAbi, crowdBytecode, signer, [
      walletAddress,
      token.address,
      tokensBN.div(rate),
      openingTs,
      closingTs,
      rate,
    ]);

    await crowdsale.deployed();

    setCrowdsaleAddress(crowdsale.address);
    await updateTokenInfo(symbol, { crowdsale_address: crowdsale.address });
    setToken((prevToken) => {
      return {
        ...prevToken,
        crowdsale_address: crowdsale.address,
      };
    });

    //verificacion
    const crowdCtorEncoded = ethers.utils.defaultAbiCoder
      .encode(
        ["address", "address", "uint256", "uint256", "uint256", "uint256"],
        [
          walletAddress,
          token.address,
          tokensBN.div(rate),
          openingTs,
          closingTs,
          rate,
        ]
      )
      .replace(/^0x/, "");
    await delay(15000);

    await verifyContract(
      crowdsale.address,
      "contracts/Crowdsale.sol:Crowdsale",
      crowdCtorEncoded
    );

    return crowdsale;
  };

  const finalizeAndRenewCrowdsale = async () => {
    const signer = await ethers5Adapter.signer.toEthers({
      client,
      chain,
      account,
    });
    const toastId = toast.loading(t("finalizing_crowdsale"), {
      theme: "dark",
    });
    setLoading(true);

    try {
      const crowdsaleContract = new ethers.Contract(
        token?.crowdsale_address,
        crowdAbi,
        signer
      );

      const alreadyFinalized = await crowdsaleContract.isFinalized();
      if (!alreadyFinalized) {
        const finalizeTx = await crowdsaleContract.finalize();
        await finalizeTx.wait();
        showLoadingToast(toastId, t("renewing_crowdsale"));
      } else {
        showLoadingToast(toastId, "Crowdsale already finalized. Renewing...");
      }

      const tokenContract = new ethers.Contract(
        token.token_address,
        tokenAbi,
        signer
      );

      const walletAddress = await signer.getAddress();
      const walletBalance = await tokenContract.balanceOf(walletAddress);
      const totalTokens = ethers.utils.formatEther(walletBalance);

      await updateTokenInfo(getValues().symbol, {
        cap: totalTokens,
        tokensToCrowdsale: totalTokens,
        transfered_to_crowdsale: false,
      });
      setToken((prev) => ({
        ...prev,
        cap: totalTokens,
        tokensToCrowdsale: totalTokens,
        transfered_to_crowdsale: false,
      }));

      const tokensBN = ethers.utils.parseEther(
        String(v.tokensToCrowdsale || "").trim()
      );

      const rate = Number(String(v.rate || "").trim());

      const weiCapBN = tokensBN.div(rate);
      if (weiCapBN.isZero())
        throw new Error("Rate demasiado alto para los tokens");

      const openingTs = Math.floor(toTimestamp(v.openingTime));
      const closingTs = Math.floor(toTimestamp(v.closingTime));

      showLoadingToast(toastId, t("Deploying new crowdsale..."));

      const newCrowdsale = await deployContract(
        crowdAbi,
        crowdBytecode,
        signer,
        [
          v.walletAddress,
          token?.token_address,
          ethers.utils.parseEther(totalTokens).div(v.rate),
          openingTs,
          closingTs,
          v.rate,
        ]
      );

      await newCrowdsale.deployed();
      await updateTokenInfo(getValues().symbol, {
        crowdsale_address: newCrowdsale.address,
      });
      setCrowdsaleAddress(newCrowdsale.address);
      updateSuccessToast(toastId, t("crowdsale_renewed"));

      const crowdCtorEncoded = ethers.utils.defaultAbiCoder
        .encode(
          ["address", "address", "uint256", "uint256", "uint256", "uint256"],
          [
            v.walletAddress,
            token?.token_address,
            ethers.utils.parseEther(totalTokens).div(v.rate),
            openingTs,
            closingTs,
            v.rate,
          ]
        )
        .replace(/^0x/, "");
      await delay(15000);

      await verifyContract(
        newCrowdsale.address,
        "contracts/Crowdsale.sol:Crowdsale",
        crowdCtorEncoded
      );

      setTransferDisabled(false);
      setTransferDone(false);
    } catch (error) {
      console.error("Finalize & Renew failed:", error);
      updateErrorToast(toastId, error.message || t("fin_and_renew_fail"));
    } finally {
      setLoading(false);
    }
  };

  const transferTokensToCrowdsale = async () => {
    const signer = await ethers5Adapter.signer.toEthers({
      client,
      chain,
      account,
    });
    const toastId = toast.loading(t("Wait please..."), {
      theme: "dark",
    });
    setLoading(true);

    try {
      const code = await signer.provider.getCode(crowdsaleAddress);
      if (code === "0x") {
        throw new Error("Crowdsale contract not found on-chain.");
      }

      const tokensBN = ethers.utils.parseEther(
        String(getValues().tokensToCrowdsale).trim()
      );

      const tokenContract = new ethers.Contract(
        token?.token_address,
        tokenAbi,
        signer
      );

      try {
        await tokenContract.estimateGas.transfer(crowdsaleAddress, tokensBN);
        console.log("Gas estimation succeeded, proceeding to transfer");
      } catch (err) {
        console.error("Gas estimation failed:", err);
        throw new Error(
          "Cannot transfer tokens: gas estimation failed. Make sure the contract is ready."
        );
      }

      showLoadingToast(toastId, t("Transferring tokens to crowdsale..."));
      const tx = await tokenContract.transfer(crowdsaleAddress, tokensBN);
      await tx.wait();
      updateSuccessToast(toastId, t("tokens_transferred"));

      await updateTokenInfo(getValues().symbol, {
        transfered_to_crowdsale: true,
      });
      setTransferDisabled(true);
      setTransferDone(true);
      router.push("/provisioning");
    } catch (error) {
      console.error("Transfer failed:", error);
      updateErrorToast(toastId, error.message || "Transfer failed");
      setTransferDisabled(false);
    } finally {
      setLoading(false);
    }
  };

  const finalizeCrowdsale = async () => {
    const signer = await ethers5Adapter.signer.toEthers({
      client,
      chain,
      account,
    });
    const toastId = toast.loading(t("finalizing_crowdsale"), {
      theme: "dark",
    });
    setLoading(true);

    try {
      const crowdsaleContract = new ethers.Contract(
        token?.crowdsale_address,
        crowdAbi,
        signer
      );

      const alreadyFinalized = await crowdsaleContract.isFinalized();
      if (alreadyFinalized) {
        toast.update(toastId, {
          render: t("crowdsale_already_finalized"),
          isLoading: false,
          type: "info",
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }

      const finalizeTx = await crowdsaleContract.finalize();
      await finalizeTx.wait();

      updateSuccessToast(toastId, t("crowdsale_finalized"));

      const tokenContract = new ethers.Contract(
        token?.token_address,
        tokenAbi,
        signer
      );

      const walletAddress = await signer.getAddress();
      const walletBalance = await tokenContract.balanceOf(walletAddress);
      const totalTokens = ethers.utils.formatEther(walletBalance);

      await updateTokenInfo(token?.symbol, {
        cap: totalTokens,
        transfered_to_crowdsale: false,
        crowdsale_address: "",
        crowdsale_finalized: true,
      });

      setToken((prev) => ({
        ...prev,
        cap: totalTokens,
        crowdsaleAddress: "",
        transfered_to_crowdsale: false,
      }));
      setTransferDisabled(true);
      setDisableDeploy(false);
      router.push(`/provisioning`);
    } catch (error) {
      console.error("Finalize failed:", error);
      updateErrorToast(toastId, error.message || t("finalize_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeployAll = async () => {
    setLoading(true);
    const toastId = toast.loading("⏳ Starting deployment...", {
      theme: "dark",
    });

    try {
      if (!v.tokensToCrowdsale || isNaN(v.tokensToCrowdsale)) {
        throw new Error("Invalid number of tokens to transfer");
      }

      const provider = ethers5Adapter.provider.toEthers({
        client: client,
        chain: chain,
        account: account,
      });

      // Deploy token
      const token = await deployToken(toastId);
      setTokenAddress(token.address);

      // Confirm token deployment
      showLoadingToast(toastId, t("Wait please..."));

      while (true) {
        const code = await provider.getCode(token.address);
        if (code !== "0x") break;
        await new Promise((res) => setTimeout(res, 4000));
      }

      // Deploy crowdsale
      const crowdsale = await deployCrowdsale(token, toastId);
      setCrowdsaleAddress(crowdsale.address);

      // Confirm crowdsale deployment
      showLoadingToast(toastId, t("Wait please..."));

      while (true) {
        const code = await provider.getCode(crowdsale.address);
        if (code !== "0x") break;
        await new Promise((res) => setTimeout(res, 4000));
      }

      updateSuccessToast(toastId, t("deploy_complete"));

      setDisableDeploy(true);
      setTransferDisabled(false);
      setDeploymentComplete(true);
    } catch (error) {
      console.log(error);
      updateErrorToast(toastId, error.message || "Deployment failed");
    } finally {
      setLoading(false);
    }
  };
  return {
    deployToken,
    deployCrowdsale,
    finalizeAndRenewCrowdsale,
    transferTokensToCrowdsale,
    finalizeCrowdsale,
    loading,
    token,
    tokenAddress,
    crowdsaleAddress,
    setLoading,
    account,
    handleDeployAll,
    deploymentComplete,
    setSelectedWinery,
    selectedWinery,
  };
};

export default useDeployment;
