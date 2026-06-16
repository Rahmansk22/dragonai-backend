export const config = {
  PORT: Number(process.env.PORT || 4000),
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  MODEL: "llama-3.1-8b-instant",
};
