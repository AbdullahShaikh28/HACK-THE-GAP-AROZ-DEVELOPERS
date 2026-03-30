import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#e2e8f0",
        background: "#f8fafc",
        foreground: "#0f172a",
        muted: "#64748b",
        primary: "#0f172a",
        accent: "#e2e8f0",
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
