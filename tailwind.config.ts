import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#faf8ff",
        surface: "#ffffff",
        "surface-low": "#f3f3fe",
        "surface-mid": "#ededf9",
        "surface-high": "#e7e7f3",
        primary: "#2563eb",
        "primary-dark": "#004ac6",
        secondary: "#505f76",
        outline: "#737686",
        "outline-variant": "#d9ddea",
        success: "#18805c",
        warning: "#b7791f",
        danger: "#ba1a1a",
        "text-main": "#191b23",
        "text-muted": "#434655"
      },
      fontFamily: {
        sans: ["Inter", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        display: ["Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        card: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)"
      }
    }
  },
  plugins: []
};

export default config;
