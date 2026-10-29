/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // आपकी LUMIA DUSK वेबसाइट के Custom Colors
        'dusk-gold': '#C6A972',  // सुनहरा
        'dusk-green-dark': '#1A3C34', // गहरा हरा
        'dusk-green-light': '#143029', // थोड़ा हल्का हरा (इनपुट फील्ड्स के लिए)
        'dusk-bg-cream': '#E8EBD6', // क्रीम/हल्का हरा बैकग्राउंड
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'], // आपकी साइट जैसा एलिगेंट फोंट
      },
    },
  },
  plugins: [],
};