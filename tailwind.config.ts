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
          DEFAULT: "#6366f1",
          light: "#a855f7"
        }
      },
      boxShadow: {
        card: "0 20px 45px -15px rgba(99, 102, 241, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
