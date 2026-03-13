/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#820000",
          light: "#b30000",
        },
        gold: "#b8960c",
        booking: {
          blue: "#003580",
          yellow: "#ffb700",
          button: "#006ce4",
          "button-hover": "#005bb8",
        },
        // add these because your component uses them 
        surface: "#f8fafc",
        border: "#e2e8f0",
        text: {
          main: "#0f172a",
          muted: "#64748b",
        },
      },
      maxWidth: {
        container: "1440px",
      },
    },
  },
  plugins: [animate],
}
