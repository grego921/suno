/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#00f2fe",
          violet: "#9333ea",
          pink: "#ec4899",
          emerald: "#10b981",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "neon-glow": "linear-gradient(135deg, rgba(0,242,254,0.15) 0%, rgba(147,51,234,0.15) 100%)",
        "cyber-grid": "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      boxShadow: {
        "neon-cyan": "0 0 20px -3px rgba(0, 242, 254, 0.4)",
        "neon-violet": "0 0 20px -3px rgba(147, 51, 234, 0.4)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave-bar": "wave-bar 1.2s ease-in-out infinite alternate",
      },
      keyframes: {
        "wave-bar": {
          "0%": { height: "20%" },
          "100%": { height: "100%" },
        },
      },
    },
  },
  plugins: [],
};
