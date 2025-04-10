import axios from "axios";

const axiosConfig = axios.create({
    baseURL: "http://localhost:5000",
    // baseURL: "https://watercan-backend.vercel.app",
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosConfig;