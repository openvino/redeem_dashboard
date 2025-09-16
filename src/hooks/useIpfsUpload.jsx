import axios from "axios";
import imageCompression from "browser-image-compression";
import { useState } from "react";

const acceptedImagesFormat = ["jpeg", "png", "jpg"];

export function useIpfsUpload() {
	const [uploading, setUploading] = useState(false);
	const [ipfsUrl, setIpfsUrl] = useState("");

	const uploadImage = async (rawFile) => {
		let imageType = rawFile.name.toString();
		let fileType = imageType.split(".").pop();

		if (!acceptedImagesFormat.includes(fileType)) {
			throw new Error("Unsupported image type");
		}

		setUploading(true);

		try {
			// Compress image
			const file = await imageCompression(rawFile, {
				maxSizeMB: 1,
				maxWidthOrHeight: 1024,
			});

			// Prepare FormData
			const formData = new FormData();
			formData.append("file", file);

			// Upload to IPFS
			const apiKey = process.env.NEXT_PUBLIC_OPENVINO_API_KEY;
			const apiUrl = `${process.env.NEXT_PUBLIC_OPENVINO_API_URL}/ipfs/add`;

			const response = await axios.post(apiUrl, formData, {
				headers: {
					"X-Api-Key": apiKey,
				},
			});

			const url = `https://ipfst.costaflores.openvino.org/ipfs/${response.data.cid}`;
			setIpfsUrl(url);

			return { cid: response.data.cid, url };
		} catch (error) {
			console.error("❌ Error uploading to IPFS:", error);
			throw error;
		} finally {
			setUploading(false);
		}
	};

	return { uploadImage, uploading, ipfsUrl };
}
