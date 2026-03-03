import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-barlow)", "sans-serif"],
        display: ["var(--font-oswald)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      colors: {
        // ── Semantic tokens (respect dark/light via CSS vars) ──────────────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // ── Brand palette (absolute) ───────────────────────────────────────────
        brand: {
          yellow:        "#F5B800",
          yellowdark:    "#D4A000",
          yellowLight:   "#FFD000",
          amber:         "#F5A623",
          black:         "#0A0A0A",
          "gray-950":    "#0D0D0D",
          "gray-900":    "#111111",
          "gray-800":    "#1A1A1A",
          "gray-700":    "#242424",
          "gray-600":    "#2E2E2E",
          "gray-500":    "#3D3D3D",
          "gray-400":    "#606060",
          "gray-300":    "#888888",
          "gray-200":    "#B0B0B0",
          "gray-100":    "#D8D8D8",
          "gray-50":     "#F0F0F0",
          white:         "#F8F8F8",
          "light-bg":    "#F5F5F0",
          "light-card":  "#FFFFFF",
          "light-border":"#E2E2DC",
        },
      },
      spacing: {
        "navbar-h": "64px",
        "subnav-h": "40px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "cart-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.3)" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "bolt-pulse": {
          "0%, 100%": { opacity: "1",   transform: "scale(1)" },
          "50%":      { opacity: "0.7", transform: "scale(0.92)" },
        },
      },
      animation: {
        shimmer:       "shimmer 2s linear infinite",
        "cart-bounce": "cart-bounce 0.4s ease-in-out",
        "slide-up":    "slide-up 0.5s ease-out",
        "fade-in":     "fade-in 0.3s ease-out",
        "bolt-pulse":  "bolt-pulse 2s ease-in-out infinite",
      },
      backgroundImage: {
        "shimmer-gradient":
          "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--muted)) 75%)",
        "yellow-gradient":
          "linear-gradient(135deg, #FFD000 0%, #F5B800 50%, #D4A000 100%)",
        "yellow-glow":
          "radial-gradient(circle, rgba(245,184,0,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "yellow-sm": "0 0 12px rgba(245,184,0,0.25)",
        "yellow-md": "0 0 24px rgba(245,184,0,0.30)",
        "yellow-lg": "0 0 48px rgba(245,184,0,0.20)",
      },
    },
  },
  plugins: [],
};

export default config;