/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "lavender-mist": "#e6e0f8",
        "primary": "rgb(var(--primary-rgb, 175 10 120) / <alpha-value>)",
        "primary-container": "rgb(var(--primary-container-rgb, 207 49 146) / <alpha-value>)",
        "on-primary": "#ffffff",
        "on-primary-container": "#fffbff",
        "inverse-primary": "var(--inverse-primary, #ffafd5)",
        "primary-fixed": "var(--primary-fixed, #ffd8e8)",
        "primary-fixed-dim": "var(--primary-fixed-dim, #ffafd5)",
        "on-primary-fixed": "var(--on-primary-fixed, #3d0027)",
        "on-primary-fixed-variant": "var(--on-primary-fixed-variant, #8a005e)",

        "secondary": "#744aa2",
        "secondary-container": "#cda0fe",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#5a3086",
        "secondary-fixed": "#efdbff",
        "secondary-fixed-dim": "#dbb8ff",
        "on-secondary-fixed": "#2b0052",
        "on-secondary-fixed-variant": "#5b3188",

        "tertiary": "#006388",
        "tertiary-container": "#007dab",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#fcfcff",
        "tertiary-fixed": "#c5e7ff",
        "tertiary-fixed-dim": "#7ed0ff",
        "on-tertiary-fixed": "#001e2d",
        "on-tertiary-fixed-variant": "#004c6a",

        "surface": "#fef7ff",
        "surface-dim": "#ded8e0",
        "surface-bright": "#fef7ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f8f1f9",
        "surface-container": "#f2ecf4",
        "surface-container-high": "#ede6ee",
        "surface-container-highest": "#e7e0e8",
        "surface-variant": "#e7e0e8",
        "surface-tint": "#b2107b",

        "on-surface": "#1d1b20",
        "on-surface-variant": "#57414a",
        "inverse-surface": "#322f35",
        "inverse-on-surface": "#f5eff6",

        "outline": "#8a707b",
        "outline-variant": "#ddbfca",

        "background": "#d6cddb",
        "on-background": "#1d1b20",

        "cream-surface": "#fffcf2",
        "candy-glaze": "rgba(255, 255, 255, 0.4)",
        
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        "sm": "0.5rem",
        "DEFAULT": "1rem",
        "md": "1.5rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "base": "8px",
        "gutter": "1.5rem",
        "container-padding-sm": "1.5rem",
        "container-padding-lg": "3rem",
        "stack-gap": "1rem"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        "display-lg": ["'Plus Jakarta Sans'", "sans-serif"],
        "headline-lg": ["'Plus Jakarta Sans'", "sans-serif"],
        "headline-lg-mobile": ["'Plus Jakarta Sans'", "sans-serif"],
        "title-md": ["'Plus Jakarta Sans'", "sans-serif"],
        "body-lg": ["'Plus Jakarta Sans'", "sans-serif"],
        "body-md": ["'Plus Jakarta Sans'", "sans-serif"],
        "label-lg": ["'Plus Jakarta Sans'", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "800" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "800" }],
        "title-md": ["20px", { lineHeight: "28px", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "700" }],
      },
      boxShadow: {
        'plush': 'inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 8px 24px rgba(175, 10, 120, 0.1)',
        'plush-hover': 'inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 12px 30px rgba(175, 10, 120, 0.15)',
        'candy': 'inset 0 -4px 8px rgba(0, 0, 0, 0.1), inset 0 4px 8px rgba(255, 255, 255, 0.6), 0 4px 12px rgba(175, 10, 120, 0.25)',
        'candy-glow': '0 0 20px rgba(207, 49, 146, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.7)',
        'glass-bead': 'inset 0 1px 2px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0, 0, 0, 0.05)',
        'sunken-well': 'inset 3px 3px 8px rgba(87, 65, 74, 0.12), inset -3px -3px 8px rgba(255, 255, 255, 0.9)',
        'sunken-focus': 'inset 3px 3px 10px rgba(175, 10, 120, 0.18), inset -3px -3px 8px rgba(255, 255, 255, 1)',
      }
    },
  },
  plugins: [],
}
