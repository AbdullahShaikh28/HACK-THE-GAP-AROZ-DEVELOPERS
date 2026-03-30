import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Aligned with public site (FrontendHeader): navy + orange */
        border: "#e2e8f0",
        background: "#ffffff",
        foreground: "#0f172a",
        muted: "#64748b",
        primary: "#e8610a",
        "primary-foreground": "#ffffff",
        secondary: "#e8eef5",
        "secondary-foreground": "#1a3a6e",
        input: "#e2e8f0",
        ring: "#e8610a",
        destructive: "#dc2626",
        accent: "#f1f5f9",
        "muted-foreground": "#64748b",
        sidebar: "#1a3a6e",
        "sidebar-foreground": "#ffffff",
        "sidebar-primary": "#e8610a",
        "sidebar-primary-foreground": "#ffffff",
        "sidebar-accent": "rgba(255,255,255,0.1)",
        "sidebar-accent-foreground": "#ffffff",
        "sidebar-border": "rgba(255,255,255,0.15)",
        "sidebar-ring": "#e8610a",
        csmc: {
          navy: "#1a3a6e",
          orange: "#e8610a",
          "orange-mid": "#f5a623",
          "orange-deep": "#f47c2e",
        },
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
