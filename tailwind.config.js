/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "outline": "#a48a91",
        "on-secondary-fixed": "#101c2c",
        "surface-tint": "#ffb0cb",
        "secondary-fixed": "#d7e3fa",
        "background": "#121416",
        "surface-container-highest": "#333537",
        "surface": "#121416",
        "surface-container": "#1e2022",
        "on-primary-container": "#58002f",
        "surface-dim": "#121416",
        "on-tertiary-container": "#002f32",
        "tertiary-fixed": "#63f7ff",
        "surface-variant": "#333537",
        "frosted-glass": "rgba(255, 255, 255, 0.04)",
        "on-surface": "#e2e2e5",
        "inverse-on-surface": "#2f3133",
        "ambient-glow": "rgba(216, 77, 138, 0.15)",
        "primary": "#ffb0cb",
        "steel-border": "rgba(255, 255, 255, 0.12)",
        "surface-container-low": "#1a1c1e",
        "error-container": "#93000a",
        "secondary": "#bbc7dd",
        "inverse-surface": "#e2e2e5",
        "on-secondary-container": "#aab6cb",
        "on-secondary": "#253142",
        "error": "#ffb4ab",
        "surface-container-high": "#282a2c",
        "tertiary-fixed-dim": "#00dce5",
        "surface-bright": "#38393c",
        "surface-container-lowest": "#0c0e10",
        "primary-fixed-dim": "#ffb0cb",
        "on-error-container": "#ffdad6",
        "on-surface-variant": "#dcbfc7",
        "primary-container": "#ec5d9a",
        "on-tertiary": "#003739",
        "on-primary-fixed": "#3e0020",
        "secondary-fixed-dim": "#bbc7dd",
        "on-tertiary-fixed-variant": "#004f53",
        "on-primary-fixed-variant": "#8c064f",
        "primary-fixed": "#ffd9e3",
        "on-background": "#e2e2e5",
        "tertiary": "#00dce5",
        "on-error": "#690005",
        "graphite": "#1A1D21",
        "on-primary": "#640036",
        "tertiary-container": "#00a1a7",
        "secondary-container": "#3c475a",
        "on-tertiary-fixed": "#002021",
        "outline-variant": "#564148",
        "on-secondary-fixed-variant": "#3c475a",
        "inverse-primary": "#ab2967"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "stack-sm": "12px",
        "margin-mobile": "16px",
        "container-max": "1440px",
        "stack-md": "24px",
        "stack-lg": "48px",
        "gutter": "24px"
      },
      fontFamily: {
        "label-sm": ["JetBrains Mono"],
        "headline-lg": ["Sora"],
        "display-lg": ["Sora"],
        "body-md": ["Hanken Grotesk"],
        "headline-lg-mobile": ["Sora"]
      },
      fontSize: {
        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "display-lg": ["64px", { "lineHeight": "72px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
