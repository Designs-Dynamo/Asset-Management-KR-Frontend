/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
       colors:  {
                        "primary": "#298089",
                        "background-light": "#f6f7f9",
                        "background-dark": "#181a1b",
                        "surface-dark": "#232627",
                        "border-dark": "#2b3536",
                        "accent-blue": "#3b82f6",
                        "error-red": "#ef4444",
                        "warning-amber": "#f59e0b",
                },
                    fontFamily: {
                        "display": ["Manrope"],
                        "sans": ["Manrope", "sans-serif"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}

