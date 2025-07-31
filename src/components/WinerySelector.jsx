
import useWineries from "@/hooks/useWineries";

export const WinerySelector = ({isFieldDisabled, setValue, setSelectedWinery, selectedWinery}) => {

  const {wineries} = useWineries();


  return (
    <div className="grid gap-2">
      <label>Select Winery</label>
      <select
         disabled={isFieldDisabled()}
      className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-[#840C4A] "
        value={selectedWinery}
        onChange={(e) => {
          setSelectedWinery(e.target.value);
          setValue("winery_id", e.target.value);
        }}
      >
        {wineries.map((winery) => (
          <option key={winery.id} value={winery.id}>
            {winery.name}
          </option>
        ))}
      </select>
    </div>
  );
};
