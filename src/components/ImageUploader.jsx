import { useIpfsUpload } from "@/hooks/useIpfsUpload";
import { toast } from "react-toastify";

export const ImageUploader = ({ label, value, imagePreview,setValue, setImage }) => {

  const {uploadImage, ipfsUrl} = useIpfsUpload();

  return (
    <div className="grid gap-2">
      <label>{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          try {
            const url = await uploadImage(file);
            console.log(url);
            setValue(value, url.url);
            setImage(url.url);
            toast.success("Bottle image uploaded to IPFS");
          } catch {
            console.log("Error uploading logo to IPFS");
            toast.error("Error uploading logo to IPFS");
          }
        }}
      />
      {imagePreview   && (
        <div className="flex flex-col items-center">
          <img
          src={imagePreview}
          alt="Preview"
          className="mt-2 rounded-xl max-h-40 object-contain"
        />
        </div>
      )}
    </div>
  );
};
