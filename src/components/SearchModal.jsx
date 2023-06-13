import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { setFilter } from "@/redux/actions/filterActions.js";

const SearchModal = ({ data, winarys }) => {
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
   // console.log(winarys);
  }, []);

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
    let formattedData = data.length > 4 ? data.slice(-4) : data;

    if (path === "/detail") {
      formattedData = formattedData.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        country_id: item.country_id,
        province_id: item.province_id,
        amount: item.amount,
      }));
    } else if (path === "/winaryDetail") {
      formattedData = formattedData.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        // country_id: item.country_id,
        // province_id: item.province_id,
        // amount: item.amount,
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

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const { req } = context;
  const { cookie } = req.headers;

  const response = await clientAxios.get("/winarysRoute", {
    params: {
      isAdmin: session.isAdmin,
    },
    headers: {
      Cookie: cookie,
    },
  });

  const profile = await clientAxios.post("/loginRoute", {
    public_key: session.address,
    headers: {
      Cookie: cookie,
    },
  });

  return {
    props: { winarys: response.data, profile: profile.data },
  };
}

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { useSelector, useDispatch } from "react-redux";

// const SearchModal = ({ data }) => {
//   const filters = useSelector((state) => state.filter);
//   const [show, setShow] = useState();
//   const dispatch = useDispatch();
//   const router = useRouter();
//   useEffect(() => {
//     if (router.asPath.includes("/detail")) setShow(false);
//     else setShow(true);
//   }, []);
//   console.log(data);
//   // const handleClick = (id) => {

//   //   router.push(`/detail/${id}`);
//   // };
//   const filterData = (data) => {
//     if (filters.filter) {
//       const searchString = filters.filter.toLowerCase();

//       return data.filter((obj) =>
//         Object.values(obj).some((value) =>
//           String(value).toLowerCase().includes(searchString)
//         )
//       );
//     } else {
//       return data;
//     }
//   };

//   const formatData = () => {
//     let formatedData = data.length > 4 ? data.slice(-4) : data;

//     formatedData = formatedData.map((item) => ({
//       id: item.id,
//       name: item.name,
//       email: item.email,
//       country_id: item.country_id,
//       province_id: item.province_id,
//       amount: item.amount,
//     }));

//     return formatedData;
//   };

//   data = formatData(data);
//   console.log(data);
//   if (!show) {
//     console.log("showing");
//     return null;
//   } else
//     return (
//       <div className="fixed inset-0 flex justify-center items-center z-50">
//         <div className="fixed top-[6rem] right-8 bg-opacity-90 md:right[20%] md:top-[6rem] ">
//           <div className="bg-[#F1EDE2] bg-opacity-70 shadow-xl p-2 rounded-lg">
//             {data.map((e) => (
//               <p
//                 className="text-xs cursor-pointer"
//                 onClick={() => handleClick(e.id)}
//                 key={e.id}
//               >
//                 {e.id} {e.name} {e.email} {e.country_id}
//               </p>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
// };

// export default SearchModal;
