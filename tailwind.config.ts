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
        "primary-foreground": "#ffffff",
        secondary: "#e2e8f0",
        "secondary-foreground": "#0f172a",
        input: "#e2e8f0",
        ring: "#94a3b8",
        destructive: "#dc2626",
        accent: "#e2e8f0",
        "muted-foreground": "#64748b",
        sidebar: "#ffffff",
        "sidebar-foreground": "#0f172a",
        "sidebar-primary": "#0f172a",
        "sidebar-primary-foreground": "#ffffff",
        "sidebar-accent": "#f1f5f9",
        "sidebar-accent-foreground": "#0f172a",
        "sidebar-border": "#e2e8f0",
        "sidebar-ring": "#94a3b8",
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
