import axios from "axios";


const clientAxios = axios.create({
        baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/routes`
    })



export default clientAxios