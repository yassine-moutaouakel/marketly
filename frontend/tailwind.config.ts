import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        sand: "#f5efe6",
        ember: "#c24721",
        pine: "#1f5c4c",
        gold: "#f5b447",
        mist: "#dbe7df"
      },
      boxShadow: {
        card: "0 24px 80px rgba(16, 24, 40, 0.12)"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        reveal: "reveal 0.7s ease-out both"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        reveal: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
