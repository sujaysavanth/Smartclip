import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#00f5d4",
          light: "#00bbf9",
          accent: "#f72585",
          dark: "#080b1b"
        },
        surface: {
          DEFAULT: "#0d1226",
          elevated: "#161b3a",
          highlight: "#1f2651",
          border: "#2c356a"
        }
      },
      boxShadow: {
        card: "0 30px 60px -25px rgba(0, 187, 249, 0.45)"
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at 15% 20%, rgba(0, 245, 212, 0.25), transparent 55%), radial-gradient(circle at 85% 0%, rgba(247, 37, 133, 0.25), transparent 45%)"
      }
    }
  },
  plugins: []
};

export default config;
