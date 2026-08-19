// This file teaches Tailwind our custom colors, fonts, and a few
// small animations. Loaded right after the Tailwind CDN script on
// every single page, so the whole site stays consistent.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        paper: "#F8F5EF",      // warm cream background, the base of every page
        ink: "#161410",         // near black, our main text color
        inkraise: "#211E18",     // slightly lighter black, used for dark section backgrounds
        gold: "#B8873B",          // the premium accent, buttons, highlights, icons
        emerald: "#123A5C",        // second accent, now a rich navy blue, used for contrast against gold
        mist: "#EFEAE0",             // a soft neutral for card backgrounds and dividers
        navy: "#0E1B2B",              // deep international blue-black, used for global/map sections
        steel: "#4A5A6B",              // muted blue-gray, world map landmass
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "sans-serif"],  // headings
        body: ["Manrope", "sans-serif"],                   // paragraphs, labels, buttons
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
