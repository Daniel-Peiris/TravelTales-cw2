/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#eff6ff",
					500: "#3b82f6",
					600: "#2563eb",
					700: "#1d4ed8",
				},
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
			},
			animation: {
				"fade-in": "fadeIn 0.3s ease-out",
				"slide-up": "slideUp 0.3s ease-out",
				"bounce-subtle": "bounceSubtle 0.6s ease-in-out",
			},
			keyframes: {
				fadeIn: {
					from: {
						opacity: "0",
						transform: "translateY(10px)",
					},
					to: {
						opacity: "1",
						transform: "translateY(0)",
					},
				},
				slideUp: {
					from: {
						opacity: "0",
						transform: "translateY(20px)",
					},
					to: {
						opacity: "1",
						transform: "translateY(0)",
					},
				},
				bounceSubtle: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" },
				},
			},
			spacing: {
				18: "4.5rem",
				88: "22rem",
			},
			maxWidth: {
				"8xl": "88rem",
			},
		},
	},
	plugins: [],
};
