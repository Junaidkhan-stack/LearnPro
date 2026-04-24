/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFF",     // soft blue-white background
        surface: "#FFFFFF",        // cards & inputs

        primary: "#4F46E5",        // indigo blue (main)
        primaryLight: "#6366F1",   // lighter indigo
        primaryDark: "#4338CA",    // darker indigo (pressed / active)

        textPrimary: "#1E1B4B",    // deep indigo text
        textSecondary: "#6B7280",  // neutral gray

        border: "#E0E7FF",         // soft indigo border
        success: "#16A34A",
        danger: "#DC2626",       
      },
    },
  },
  plugins: [],
}