// Real Tailwind config file (not the CDN-style tailwind.config = {...}
// object). This is what the Tailwind CLI reads directly, and its
// "content" array tells it exactly which files to scan for class
// names, this is more reliable across Windows/Mac/Linux than passing
// a glob pattern on the command line, since Node resolves it
// internally instead of depending on how your terminal expands "*".
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        paper: "#F8F5EF",
        ink: "#161410",
        inkraise: "#211E18",
        gold: "#B8873B",
        emerald: "#123A5C",
        mist: "#EFEAE0",
        navy: "#0E1B2B",
        steel: "#4A5A6B",
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      keyframes: {
        floatSlow: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        fadeUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        pinPulse: {
          "0%": { transform: "scale(0.9)", opacity: 0.8 },
          "70%": { transform: "scale(2.4)", opacity: 0 },
          "100%": { transform: "scale(2.4)", opacity: 0 },
        },
      },
      animation: {
        floatSlow: "floatSlow 6s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        fadeUp: "fadeUp .6s ease both",
        pinPulse: "pinPulse 2.4s ease-out infinite",
      },
    },
  },
};
