import axios from "axios";

const geminiService = async (prompt) => {
  try {
    console.log("🚀 Calling Gemini API...");

    const response = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    console.log("✅ Gemini response received");

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error("🔥 GEMINI ERROR FULL:", error.response?.data || error.message);
    throw new Error("AI analysis failed");
  }
};
return JSON.parse(
  response.data?.candidates?.[0]?.content?.parts?.[0]?.text
);
export default geminiService;