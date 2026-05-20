import axios from "axios";

const API = "http://localhost:5000";

export const analyzeCode = async (code) => {
    const response = await axios.post(
        `${API}/api/review/analyze`,
        { code }
    );

    return response.data;
};