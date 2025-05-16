import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { setFilter } from "@/redux/actions/filterActions.js";

const SearchModal = ({ data }) => {
  const filters = useSelector((state) => state.filter);

  const [show, setShow] = useState(false);
  const [path, setPath] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (router.asPath.includes("/detail")) {
      setPath("/detail");
      setShow(true);
    } else if (router.asPath.includes("/winaryDetail")) {
      setPath("/winaryDetail");

      setShow(true);
    } else {
      setShow(false);
    }
  });

  const handleClick = (id) => {
    dispatch(setFilter(""));
    router.push(`${path}/${id}`);
  };

  const filterData = (data) => {
    if (filters.filter) {
      const searchString = filters.filter.toLowerCase();

      return data.filter((obj) =>
        Object.values(obj).some((value) =>
          String(value).toLowerCase().includes(searchString)
        )
      );
    } else {
      return data;
    }
  };

  const formatData = (data) => {
    let formattedData;
    if (path === "/detail") {
      formattedData = data.length > 4 ? data.slice(-4) : data;
      formattedData = formattedData.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        country_id: item.country_id,
        province_id: item.province_id,
        amount: item.amount,
      }));
    } else if (path === "/winaryDetail" && data.length) {
      formattedData = data.length > 4 ? data.slice(-4) : data;
      formattedData = formattedData.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
      }));
    }

    return formattedData;
  };

  const filteredData = formatData(filterData(data));
  if (!show || !filters.filter) {
    return null;
  } else {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="fixed top-[6rem] right-8 bg-opacity-[90%] md:right-[20%] md:top-[6rem] ">
          <div className="bg-[#F1EDE2] bg-opacity-70 shadow-xl p-2 rounded-lg">
            {filteredData.map((e) => (
              <p
                className="text-xs cursor-pointer"
                onClick={() => handleClick(e.id)}
                key={e.id}
              >
                {e.id} {e.name} {e.email} {e.country_id}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }
};

export default SearchModal;
