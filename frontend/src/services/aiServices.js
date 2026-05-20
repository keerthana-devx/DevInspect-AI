import axios from "axios";

export const analyzeCode = async (code, language) => {
  const res = await axios.post("http://localhost:5000/api/ai/analyze", {
    code,
    language,
  });
  return res.data;
};