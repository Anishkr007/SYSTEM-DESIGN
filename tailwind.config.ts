import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        primaryAlpha: "var(--primary-alpha)",
        secondary: "var(--secondary)",
        secondaryAlpha: "var(--secondary-alpha)",
        surface: "var(--surface)",
        surfaceHover: "var(--surface-hover)",
        border: "var(--border)",
        borderHover: "var(--border-hover)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",
        accentRed: "var(--accent-red)",
        accentGreen: "var(--accent-green)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'primary-gradient': 'linear-gradient(to right, var(--primary), #a855f7)',
      },
      boxShadow: {
        'neon-primary': '0 0 20px var(--primary-alpha), 0 0 40px var(--primary-alpha)',
        'neon-secondary': '0 0 20px var(--secondary-alpha), 0 0 40px var(--secondary-alpha)',
        'neon-red': '0 0 20px rgba(239, 68, 68, 0.2), 0 0 40px rgba(239, 68, 68, 0.1)',
        'neon-green': '0 0 20px rgba(34, 197, 94, 0.2), 0 0 40px rgba(34, 197, 94, 0.1)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
